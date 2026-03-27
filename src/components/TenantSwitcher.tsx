/**
 * TenantSwitcher — Dropdown in sidebar/header for switching between companies.
 * Only visible to MainAdminUser when multiple tenants exist.
 */
import { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { tenantsApi, type Tenant } from '@/services/api/tenantsApi';
import { getCurrentTenant, setTenantOverride } from '@/utils/tenant';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

export function TenantSwitcher() {
  const { isMainAdmin } = usePermissions();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSlug = getCurrentTenant();

  useEffect(() => {
    if (!isMainAdmin) {
      setLoading(false);
      return;
    }

    tenantsApi.list()
      .then(data => {
        setTenants(data.filter(t => t.isActive));
      })
      .catch(() => {
        // Tenants API might not exist yet (pre-migration)
        setTenants([]);
      })
      .finally(() => setLoading(false));
  }, [isMainAdmin]);

  // Don't render if not admin or only one tenant
  if (!isMainAdmin || loading || tenants.length <= 1) return null;

  const currentTenant = tenants.find(t => t.slug === currentSlug) 
    || tenants.find(t => t.isDefault) 
    || tenants[0];

  const handleSwitch = (tenant: Tenant) => {
    if (tenant.slug === currentSlug) return;
    // Always send the tenant slug — backend TenantSlugCache maps
    // the default tenant's slug to TenantId=0 automatically.
    setTenantOverride(tenant.slug);
    // Page reloads automatically via setTenantOverride
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg w-full",
            "text-sm font-medium text-sidebar-foreground",
            "hover:bg-sidebar-accent transition-colors",
            "border border-border/40 bg-sidebar-accent/30"
          )}
        >
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate flex-1 text-left">
            {currentTenant?.companyName || 'Select Company'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {tenants.map(tenant => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSwitch(tenant)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1">{tenant.companyName}</span>
            {tenant.isDefault && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1">Default</Badge>
            )}
            {tenant.slug === currentSlug && (
              <Check className="h-4 w-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate('/dashboard/settings', { state: { section: 'companies' } })}
          className="flex items-center gap-2 cursor-pointer text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          <span>Manage Companies</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
