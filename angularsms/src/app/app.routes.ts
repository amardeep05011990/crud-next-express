// import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { CrudComponent } from './forms/crud/crud.component';
import { DynamicFormComponent } from './forms/dynamic-form/dynamic-form.component';
import { UserFormComponent } from './forms/user-form/user-form.component';

// export const routes: Routes = [
//   {path: "home", component: HomeComponent},
//   {path: "users", component: UsersComponent},
//   {path: "crud",  component: CrudComponent},
//   {path: "dynamicform",  component: DynamicFormComponent},
//    { path: 'userform/add', component: UserFormComponent },
//   { path: 'userform/edit/:id', component: UserFormComponent },


//   { path: '', redirectTo: 'users', pathMatch: 'full' }
// ];


import { Routes } from '@angular/router';
// import { LayoutComponent } from './layouts/layout.component';
import { Component } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './front/landing/landing.component';

@Component({ standalone: true, template: `<h2 class="mb-3">Dashboard</h2><p>Welcome!</p>` })
export class DashboardPage {}

@Component({ standalone: true, template: `<h2>Users</h2>` })
export class UsersPage {}

@Component({ standalone: true, template: `<h2>Settings</h2>` })
export class SettingsPage {}

@Component({ standalone: true, template: `<h2>Profile</h2>` })
export class ProfilePage {}

@Component({ standalone: true, template: `<h2>Notifications</h2>` })
export class NotificationsPage {}

export const routes: Routes = [
    {
    path:'', component: LandingComponent
  },
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardPage,  data: { breadcrumb: 'Dashboard' } },
      { path: 'dashboard', component: DashboardPage, data: { breadcrumb: 'Dashboard' } },
      { path: 'users', component: UsersPage },
      { path: 'settings', component: SettingsPage },
      { path: 'profile', component: ProfilePage },
      { path: 'notifications', component: NotificationsPage },
      {path: "home", component: HomeComponent},
      {path: "users", component: UsersComponent},
      {path: "crud",  component: CrudComponent},
      {path: "dynamicform",  component: DynamicFormComponent},
      { path: 'userform/add', component: UserFormComponent ,  data: { breadcrumb: 'add' }},
      { path: 'userform/edit/:id', component: UserFormComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  },

];
