import { Routes } from '@angular/router';
import { LandingPage } from './component/landing-page/landing-page';
import { Signup } from './component/signup/signup.component';

export const routes: Routes = [
  {
    path: '',                       // default route
    redirectTo: 'landing',          // redirect to 'landing'
    pathMatch: 'full'
  },
  {
    path: 'landing',                // /landing route
    component: LandingPage,
    title: 'Zenivo | Home'
  },
  // {
  //   path: '**',                     // wildcard route
  //   redirectTo: '',                 // redirects back to default
  //   pathMatch: 'full'
  // },
  {
    path: "signup", component: Signup, title: "signup page"
  }
];
