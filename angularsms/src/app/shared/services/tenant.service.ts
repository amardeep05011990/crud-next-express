import { Injectable } from '@angular/core';

type Tenant = { key:string; name:string; logo:string; themeClass:string; footer:string; };

@Injectable({ providedIn: 'root' })
export class TenantService {
  private tenants: Record<string,Tenant> = {
    a: { key:'a', name:'Tenant A', logo:'TenantA', themeClass:'bg-primary', footer:'Tenant A © 2025' },
    b: { key:'b', name:'Tenant B', logo:'TenantB', themeClass:'bg-success', footer:'Tenant B © 2025' }
  };
  private currentKey = 'a';

  getTenant(): Tenant { return this.tenants[this.currentKey]; }
  switchTenant(key: 'a'|'b') { this.currentKey = key; }
}
