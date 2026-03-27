

# Single-Database Multi-Tenancy — Complete Implementation Plan

## Architecture Summary

Single shared Neon database. Every data table gets a `"TenantId"` column (INT, default 0). EF Core Global Query Filters automatically append `WHERE "TenantId" = X` to every query. `SaveChangesAsync` override auto-stamps `TenantId` on inserts. **Zero changes to existing services or controllers.**

```text
┌─────────────────────────────────────────────────┐
│              Single Neon Database                │
├─────────────────────────────────────────────────┤
│ MainAdminUsers  (NO TenantId — shared/global)   │
│ Tenants         (NEW — company registry)        │
├─────────────────────────────────────────────────┤
│ All other tables: WHERE "TenantId" = @current   │
│ (Contacts, Offers, Sales, Users, Articles,      │
│  Dispatches, ServiceOrders, Projects, etc.)     │
└─────────────────────────────────────────────────┘
```

---

## Phase 1: SQL Migration (Single Script for Neon)

### 1a. Create Tenants table + insert default tenant (Id=0)

```sql
-- ═══════════════════════════════════════════════════════
-- MULTI-TENANCY MIGRATION — Execute on Neon
-- ═══════════════════════════════════════════════════════

-- 1. Tenants registry table
CREATE TABLE IF NOT EXISTS "Tenants" (
    "Id"              SERIAL PRIMARY KEY,
    "MainAdminUserId" INT NOT NULL REFERENCES "MainAdminUsers"("Id") ON DELETE CASCADE,
    "Slug"            VARCHAR(50) NOT NULL UNIQUE,
    "CompanyName"     VARCHAR(255) NOT NULL,
    "CompanyLogoUrl"  VARCHAR(500),
    "CompanyWebsite"  VARCHAR(500),
    "CompanyPhone"    VARCHAR(50),
    "CompanyAddress"  TEXT,
    "CompanyCountry"  VARCHAR(2),
    "Industry"        VARCHAR(100),
    "IsActive"        BOOLEAN NOT NULL DEFAULT TRUE,
    "IsDefault"       BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"       TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "IX_Tenants_MainAdminUserId" ON "Tenants"("MainAdminUserId");
CREATE INDEX IF NOT EXISTS "IX_Tenants_Slug" ON "Tenants"("Slug");

-- Insert default tenant (Id will be 1, but we use TenantId=0 as the default for all existing data)
-- The "default" tenant maps to TenantId=0 in all data tables
```

### 1b. Add TenantId to ALL data tables (single DO block)

This is the single-line-style script that adds `"TenantId" INT NOT NULL DEFAULT 0` to every table, plus an index:

```sql
DO $$
DECLARE
    tbl TEXT;
    tbls TEXT[] := ARRAY[
        'Users','UserPreferences','Roles','RolePermissions','UserRoles',
        'Skills','UserSkills','RoleSkills',
        'Contacts','ContactNotes','ContactTags','ContactTagAssignments',
        'Articles','ArticleCategories','Locations','InventoryTransactions','stock_transactions',
        'calendar_events','event_types','event_attendees','event_reminders',
        'ConnectedEmailAccounts','CustomEmailAccounts','EmailBlocklistItems','SyncedEmails','SyncedEmailAttachments','SyncedCalendarEvents',
        'Projects','ProjectColumns','ProjectNotes','ProjectActivities','ProjectTasks','DailyTasks','TaskComments','TaskAttachments','TaskTimeEntries','TaskChecklists','TaskChecklistItems','RecurringTasks','RecurringTaskLogs',
        'LookupItems','Currencies',
        'Offers','OfferItems','OfferActivities',
        'Sales','SaleItems','SaleActivities',
        'Installations','InstallationNotes','MaintenanceHistories',
        'Dispatches','DispatchTechnicians','DispatchJobs','TimeEntries','Expenses','MaterialUsage','Attachments','Notes',
        'ServiceOrders','ServiceOrderJobs','ServiceOrderMaterials','ServiceOrderTimeEntries','ServiceOrderExpenses','ServiceOrderNotes',
        'user_working_hours','user_leaves','user_status_history','dispatch_history',
        'Notifications','SystemLogs','PdfSettings',
        'NumberingSettings','NumberSequences',
        'DynamicForms','DynamicFormResponses',
        'Dashboards',
        'EntityFormDocuments',
        'AiConversations','AiMessages',
        'WorkflowDefinitions','WorkflowTriggers','WorkflowExecutions','WorkflowExecutionLogs','WorkflowApprovals','WorkflowProcessedEntities',
        'Documents','UserSignatures',
        'WB_Sites','WB_Pages','WB_PageVersions','WB_GlobalBlocks','WB_GlobalBlockUsages','WB_BrandProfiles','WB_FormSubmissions','WB_Media','WB_Templates','WB_ActivityLog',
        'UserAiKeys','UserAiPreferences',
        'payment_plans','payment_plan_installments','payments','payment_item_allocations',
        'RSRecords','TEJExportLogs',
        'SupportTickets','SupportTicketAttachments','SupportTicketComments','SupportTicketLinks',
        'AppSettings'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        -- Only add if column doesn't exist yet
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = tbl AND column_name = 'TenantId'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN "TenantId" INT NOT NULL DEFAULT 0', tbl);
            EXECUTE format('CREATE INDEX IF NOT EXISTS "IX_%s_TenantId" ON %I ("TenantId")', replace(tbl, ' ', '_'), tbl);
        END IF;
    END LOOP;
END $$;
```

**All existing rows get TenantId=0 automatically** via the DEFAULT. No data migration needed.

---

## Phase 2: Backend Changes

### 2a. New Interface — `Infrastructure/ITenantEntity.cs`

```csharp
namespace MyApi.Infrastructure;
public interface ITenantEntity
{
    int TenantId { get; set; }
}
```

### 2b. Add `TenantId` to ALL entity models (1 line each)

Every model class (except `MainAdminUser`) gets:
```csharp
public int TenantId { get; set; }
```
and implements `ITenantEntity`.

**Complete list of model files to modify** (89 files — add `int TenantId { get; set; }` and `: ITenantEntity`):

- `Modules/Users/Models/User.cs`
- `Modules/Preferences/Models/UserPreference.cs` (UserPreferences table)
- `Modules/Roles/Models/Role.cs`
- `Modules/Roles/Models/RolePermission.cs`
- `Modules/Users/Models/UserRole.cs`
- `Modules/Skills/Models/Skill.cs`
- `Modules/Skills/Models/UserSkill.cs`
- `Modules/Skills/Models/RoleSkill.cs`
- `Modules/Contacts/Models/Contact.cs`
- `Modules/Contacts/Models/ContactNote.cs`
- `Modules/Contacts/Models/ContactTag.cs`
- `Modules/Contacts/Models/ContactTagAssignment.cs`
- `Modules/Articles/Models/Article.cs`
- `Modules/Articles/Models/ArticleCategory.cs`
- `Modules/Articles/Models/Location.cs`
- `Modules/Articles/Models/InventoryTransaction.cs`
- `Modules/Articles/Models/StockTransaction.cs`
- `Modules/Calendar/Models/CalendarEvent.cs`
- `Modules/Calendar/Models/EventType.cs`
- `Modules/Calendar/Models/EventAttendee.cs`
- `Modules/Calendar/Models/EventReminder.cs`
- `Modules/EmailAccounts/Models/ConnectedEmailAccount.cs`
- `Modules/EmailAccounts/Models/CustomEmailAccount.cs`
- `Modules/EmailAccounts/Models/EmailBlocklistItem.cs`
- `Modules/EmailAccounts/Models/SyncedEmail.cs`
- `Modules/EmailAccounts/Models/SyncedEmailAttachment.cs`
- `Modules/EmailAccounts/Models/SyncedCalendarEvent.cs`
- `Modules/Projects/Models/Project.cs`
- `Modules/Projects/Models/ProjectColumn.cs`
- `Modules/Projects/Models/ProjectNote.cs`
- `Modules/Projects/Models/ProjectActivity.cs`
- `Modules/Projects/Models/ProjectTask.cs`
- `Modules/Projects/Models/DailyTask.cs`
- `Modules/Projects/Models/TaskComment.cs`
- `Modules/Projects/Models/TaskAttachment.cs`
- `Modules/Projects/Models/TaskTimeEntry.cs`
- `Modules/Projects/Models/TaskChecklist.cs`
- `Modules/Projects/Models/TaskChecklistItem.cs`
- `Modules/Projects/Models/RecurringTask.cs`
- `Modules/Projects/Models/RecurringTaskLog.cs`
- `Modules/Lookups/Models/LookupItem.cs`
- `Modules/Lookups/Models/Currency.cs`
- `Modules/Offers/Models/Offer.cs`
- `Modules/Offers/Models/OfferItem.cs`
- `Modules/Offers/Models/OfferActivity.cs`
- `Modules/Sales/Models/Sale.cs`
- `Modules/Sales/Models/SaleItem.cs`
- `Modules/Sales/Models/SaleActivity.cs`
- `Modules/Installations/Models/Installation.cs`
- `Modules/Installations/Models/InstallationNote.cs`
- `Modules/Installations/Models/MaintenanceHistory.cs`
- `Modules/Dispatches/Models/Dispatch.cs`
- `Modules/Dispatches/Models/DispatchTechnician.cs`
- `Modules/Dispatches/Models/DispatchJob.cs`
- `Modules/Dispatches/Models/TimeEntry.cs`
- `Modules/Dispatches/Models/Expense.cs`
- `Modules/Dispatches/Models/MaterialUsage.cs`
- `Modules/Dispatches/Models/Attachment.cs`
- `Modules/Dispatches/Models/Note.cs`
- `Modules/ServiceOrders/Models/ServiceOrder.cs`
- `Modules/ServiceOrders/Models/ServiceOrderJob.cs`
- `Modules/ServiceOrders/Models/ServiceOrderMaterial.cs`
- `Modules/ServiceOrders/Models/ServiceOrderTimeEntry.cs`
- `Modules/ServiceOrders/Models/ServiceOrderExpense.cs`
- `Modules/ServiceOrders/Models/ServiceOrderNote.cs`
- `Modules/Planning/Models/UserWorkingHours.cs`
- `Modules/Planning/Models/UserLeave.cs`
- `Modules/Planning/Models/UserStatusHistory.cs`
- `Modules/Planning/Models/DispatchHistory.cs`
- `Modules/Notifications/Models/Notification.cs`
- `Modules/Shared/Models/SystemLog.cs`
- `Modules/Preferences/Models/PdfSettings.cs` (PdfSettings table)
- `Modules/Numbering/Models/NumberingSettings.cs`
- `Modules/Numbering/Models/NumberSequence.cs`
- `Modules/DynamicForms/Models/DynamicForm.cs`
- `Modules/DynamicForms/Models/DynamicFormResponse.cs` (same file)
- `Modules/Dashboards/Models/Dashboard.cs`
- `Modules/Shared/Models/EntityFormDocument.cs`
- `Modules/AiChat/Models/AiConversation.cs`
- `Modules/AiChat/Models/AiMessage.cs`
- `Modules/WorkflowEngine/Models/WorkflowDefinition.cs`
- `Modules/WorkflowEngine/Models/WorkflowTrigger.cs`
- `Modules/WorkflowEngine/Models/WorkflowExecution.cs`
- `Modules/WorkflowEngine/Models/WorkflowExecutionLog.cs`
- `Modules/WorkflowEngine/Models/WorkflowApproval.cs`
- `Modules/WorkflowEngine/Models/WorkflowProcessedEntity.cs`
- `Modules/Documents/Models/Document.cs`
- `Modules/Signatures/Models/UserSignature.cs`
- All WB_* models (WBSite, WBPage, etc. — 10 files)
- `Modules/UserAiSettings/Models/UserAiKey.cs`
- `Modules/UserAiSettings/Models/UserAiPreference.cs`
- `Modules/Payments/Models/PaymentModels.cs` (4 classes in 1 file)
- `Modules/RetenueSource/Models/RSRecord.cs`
- `Modules/RetenueSource/Models/TEJExportLog.cs`
- `Modules/SupportTickets/Models/SupportTicket.cs`
- `Modules/SupportTickets/Models/SupportTicketAttachment.cs`
- `Modules/SupportTickets/Models/SupportTicketComment.cs`
- `Modules/SupportTickets/Models/SupportTicketLink.cs`
- `Modules/Settings/Models/AppSettings.cs`

### 2c. New Model — `Modules/Tenants/Models/Tenant.cs`

```csharp
[Table("Tenants")]
public class Tenant
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int MainAdminUserId { get; set; }
    [Required] [MaxLength(50)]
    public string Slug { get; set; } = string.Empty;
    [Required] [MaxLength(255)]
    public string CompanyName { get; set; } = string.Empty;
    [MaxLength(500)] public string? CompanyLogoUrl { get; set; }
    [MaxLength(500)] public string? CompanyWebsite { get; set; }
    [MaxLength(50)]  public string? CompanyPhone { get; set; }
    public string? CompanyAddress { get; set; }
    [MaxLength(2)]   public string? CompanyCountry { get; set; }
    [MaxLength(100)] public string? Industry { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
```

### 2d. Modify `ApplicationDbContext.cs` — The Core Change (~40 lines)

```csharp
public partial class ApplicationDbContext : DbContext
{
    private int _currentTenantId = 0; // Default tenant

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // NEW: Set tenant ID for this context instance
    public void SetTenantId(int tenantId) { _currentTenantId = tenantId; }
    public int GetTenantId() => _currentTenantId;

    // Add DbSet
    public DbSet<Tenant> Tenants { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        ApplyEntityConfigurations(modelBuilder);
        ApplySeedData(modelBuilder);

        // ═══ GLOBAL QUERY FILTERS ═══
        // Apply to every entity implementing ITenantEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(ApplyTenantFilter),
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, new object[] { modelBuilder, this });
            }
        }
    }

    private static void ApplyTenantFilter<T>(ModelBuilder modelBuilder, ApplicationDbContext ctx)
        where T : class, ITenantEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == ctx._currentTenantId);
    }

    // ═══ AUTO-SET TenantId ON INSERT ═══
    public override int SaveChanges()
    {
        SetTenantIdOnNewEntities();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        SetTenantIdOnNewEntities();
        return base.SaveChangesAsync(ct);
    }

    private void SetTenantIdOnNewEntities()
    {
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>()
            .Where(e => e.State == EntityState.Added))
        {
            entry.Entity.TenantId = _currentTenantId;
        }
    }
}
```

### 2e. Modify `TenantMiddleware.cs` — Resolve slug to TenantId

Update the middleware to resolve the `X-Tenant` slug to a numeric `TenantId` and store it in `HttpContext.Items["TenantId"]`:

```csharp
public async Task InvokeAsync(HttpContext context)
{
    var tenant = context.Request.Headers["X-Tenant"].FirstOrDefault()?.Trim().ToLowerInvariant();

    if (!string.IsNullOrEmpty(tenant))
    {
        context.Items["Tenant"] = tenant;
        // Resolve slug → TenantId from cache
        var tenantId = TenantSlugCache.GetTenantId(tenant);
        context.Items["TenantId"] = tenantId;
    }
    else
    {
        context.Items["TenantId"] = 0; // Default tenant
    }

    await _next(context);
}
```

Add a static `TenantSlugCache` class that loads slug→Id mappings from the Tenants table at startup and refreshes on tenant CRUD.

### 2f. Modify `Program.cs` — Set TenantId on DbContext

Update the scoped `ApplicationDbContext` registration (lines 195-214) to call `SetTenantId()`:

```csharp
builder.Services.AddScoped<ApplicationDbContext>(sp =>
{
    var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
    var tenant = httpContextAccessor.HttpContext?.Items["Tenant"] as string;
    var tenantId = httpContextAccessor.HttpContext?.Items["TenantId"] as int? ?? 0;

    ApplicationDbContext ctx;
    if (!string.IsNullOrEmpty(tenant))
    {
        var factory = sp.GetRequiredService<ITenantDbContextFactory>();
        ctx = factory.CreateDbContext(tenant);
    }
    else
    {
        var options = sp.GetRequiredService<DbContextOptions<ApplicationDbContext>>();
        ctx = new ApplicationDbContext(options);
    }

    ctx.SetTenantId(tenantId); // ← NEW LINE
    return ctx;
});
```

Also add startup cache initialization:
```csharp
// After app = builder.Build()
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    TenantSlugCache.Initialize(db);
}
```

### 2g. New `Modules/Tenants/Controllers/TenantsController.cs`

CRUD endpoints restricted to MainAdminUser:
- `GET /api/Tenants` — list all tenants for current admin
- `POST /api/Tenants` — create new company/tenant
- `PUT /api/Tenants/{id}` — update company info
- `DELETE /api/Tenants/{id}` — soft-delete (set IsActive=false)
- `POST /api/Tenants/{id}/set-default` — mark as default company

On create/update/delete, refresh `TenantSlugCache`.

### 2h. Fix Raw SQL queries (3 locations)

These bypass EF global filters and need manual `AND "TenantId" = @tenantId`:

1. **`SaleService.cs` line 522**: `UPDATE "ServiceOrders" SET "SaleId" = NULL WHERE "SaleId" = @p0` → add `AND "TenantId" = @p1`
2. **`StockTransactionService.cs` line 126**: `SELECT * FROM "Articles" WHERE "Id" = {0} FOR UPDATE` → add `AND "TenantId" = {1}`
3. **`AuthService.cs` line 395**: `SELECT setval(...)` — this is fine, no tenant filter needed (sequence reset)

### 2i. Modify `AuthService.cs` — Company Logo per Tenant

`GetCompanyLogoUrlAsync()` currently reads from `MainAdminUsers.CompanyLogoUrl`. Update to:
1. Check if there's a current tenant → read `Tenants.CompanyLogoUrl`
2. Fallback to `MainAdminUsers.CompanyLogoUrl`

---

## Phase 3: Frontend Changes

### 3a. New API service — `src/services/api/tenantsApi.ts`

```typescript
export interface Tenant {
  id: number;
  slug: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyCountry?: string;
  industry?: string;
  isActive: boolean;
  isDefault: boolean;
}

export const tenantsApi = {
  list: () => axiosInstance.get<Tenant[]>('/api/Tenants'),
  create: (data: Partial<Tenant>) => axiosInstance.post('/api/Tenants', data),
  update: (id: number, data: Partial<Tenant>) => axiosInstance.put(`/api/Tenants/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/api/Tenants/${id}`),
  setDefault: (id: number) => axiosInstance.post(`/api/Tenants/${id}/set-default`),
};
```

### 3b. New Component — `src/components/TenantSwitcher.tsx`

- Dropdown in sidebar header area (next to company name/logo)
- Shows list of tenants with their logos
- Current tenant highlighted
- Click to switch: calls `setTenantOverride(slug)` → page reloads with new tenant context
- Only visible when `isMainAdmin && tenants.length > 1`

### 3c. New Settings Section — `src/modules/settings/components/TenantManagement.tsx`

- "Companies" tab in Settings (visible only to MainAdmin)
- List all companies with status badges
- Create/Edit dialog with fields: Company Name, Slug, Logo, Website, Phone, Address, Country, Industry
- Toggle active/inactive
- Set default company button
- Delete company (with confirmation)

### 3d. Modify `src/modules/settings/pages/SettingsPage.tsx`

- Add "Companies" navigation item (only for MainAdmin)
- Route to TenantManagement component

### 3e. Modify `src/utils/tenant.ts`

Minor additions:
- `getCurrentTenantId()`: returns numeric ID from cached tenant list
- `getCurrentTenantInfo()`: returns full Tenant object (name, logo, slug)
- Keep existing `getCurrentTenant()` as-is (returns slug string)

### 3f. Modify Sidebar — Show tenant company info

When a non-default tenant is active, show that tenant's company name and logo in the sidebar header instead of the MainAdmin's company info.

### 3g. Localization — Add keys to `en.json` and `fr.json`

Add translation keys for tenant management UI:
- `settings.companies.title`, `settings.companies.create`, `settings.companies.edit`
- `settings.companies.slug`, `settings.companies.companyName`, etc.
- `tenantSwitcher.switchCompany`, `tenantSwitcher.currentCompany`

---

## What Does NOT Change (Zero Modifications)

Every existing service works automatically because:
- They all inject `ApplicationDbContext` which now has global query filters
- `SaveChangesAsync` auto-stamps `TenantId` on inserts
- All 56+ service classes, all existing controllers, all frontend API calls — unchanged

**Services verified safe** (all use `_context.TableName.Where(...)` which gets auto-filtered):
ContactService, OfferService, SaleService, ArticleService, DispatchService, InstallationService, ProjectService, TaskService, UserService, RoleService, SkillService, CalendarService, NotificationService, WorkflowService, DocumentService, PaymentService, DynamicFormService, etc.

---

## Implementation Order

1. Execute SQL migration on Neon (Phase 1)
2. Create `ITenantEntity` interface + `Tenant` model (Phase 2a, 2c)
3. Add `int TenantId` to all entity models (Phase 2b) — mechanical, 1 line per file
4. Modify `ApplicationDbContext` with global filters + SaveChanges override (Phase 2d)
5. Modify `TenantMiddleware` + `Program.cs` (Phase 2e, 2f)
6. Create `TenantsController` (Phase 2g)
7. Fix 2 raw SQL queries (Phase 2h)
8. Update `AuthService` logo resolution (Phase 2i)
9. Frontend: API service + TenantSwitcher + Settings UI (Phase 3)
10. Localization (Phase 3g)

---

## Risk Mitigation

- **Default TenantId=0**: All existing data stays accessible. Single-tenant users see no difference.
- **Global filters are transparent**: If any edge case arises, `.IgnoreQueryFilters()` can be used on specific queries.
- **Backward compatible**: No existing API contract changes. Frontend just gains new endpoints and UI.

