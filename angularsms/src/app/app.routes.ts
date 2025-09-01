// import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { CrudComponent } from './forms/crud/crud.component';
import { DynamicFormGroupComponent } from './forms/dynamic-form/dynamic-form-group.component';
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
import { FrontlayoutComponent } from './front/shared/frontlayout/frontlayout.component';
import { FronthomeComponent } from './front/shared/fronthome/fronthome.component';
import { ContactsComponent } from './front/shared/contacts/contacts.component';
import { TestimonialsComponent } from './front/shared/testimonials/testimonials.component';
import { AboutComponent } from './front/about/about.component';
import { CoursesComponent } from './front/courses/courses.component';
import { AddStudentComponent } from './front/students/add/add.component';
import { DynamicFormComponent } from './generator/dynamic-form/dynamic-form.component';
import { DynamicFormPageComponent } from './generator/dynamic-form-page/dynamic-form-page.component';
// import { PostsFormComponent } from './generator/generated/forms/posts-form/posts-form.component';
import { PostsListComponent } from './generator/generated/forms/posts-form/posts-list.component';
import { PostsFormComponent } from './generator/generated/forms/posts-form/posts-form.component';


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
    path:'', component: FrontlayoutComponent,
    children: [
       { path: '', component: FronthomeComponent },
        { path: 'about', component: AboutComponent },
        { path: 'courses', component: CoursesComponent },
        { path: 'testimonials', component:  TestimonialsComponent},
        { path: 'contact', component: ContactsComponent },
    ]
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
      {path: "dynamicformgroup",  component: DynamicFormGroupComponent},
      { path: 'userform/add', component: UserFormComponent ,  data: { breadcrumb: 'add' }},
      { path: 'userform/edit/:id', component: UserFormComponent },
      {path: "addstudents", component: AddStudentComponent},
        {path: 'dynamicform', component: DynamicFormComponent},
        {path: 'dynamicformpage', component: DynamicFormPageComponent},
        {path: "posts/add", component: PostsFormComponent},
        {path: "posts/lists", component: PostsListComponent},




      { path: '', redirectTo: 'users', pathMatch: 'full' },

    ]
  },

];
