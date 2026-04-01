import { cookies } from 'next/headers';
import { getTenantBySubdomain } from '@/config/tenants';
import { Tenant } from '@/types/tenant';

export async function getCurrentTenant(): Promise<Tenant | null> {
  const cookieStore = await cookies();
  const subdomain = cookieStore.get('tenant-subdomain')?.value;
  
  if (subdomain) {
    return getTenantBySubdomain(subdomain);
  }
  
  return null;
}
