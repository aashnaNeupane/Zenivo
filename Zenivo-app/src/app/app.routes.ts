import { Routes } from '@angular/router';
import { LandingPage } from './component/landing-page/landing-page';
import { Signup } from './component/signup/signup.component';
import { HomePage } from './component/home-page/home-page';
import { JournalsComponent } from './component/journal/journal';
import { LoginComponent } from './component/login/login';
import { ProfileComponent } from './component/profile/profile';

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
  },

  {
    path: "home", component: HomePage, title: "Home-page"
  },
  {
    path: "login", component: LoginComponent, title: "login page"
  },
  {
    path: "journal", component: JournalsComponent, title: "Journal"
  },

  {
    path: "profile", component: ProfileComponent, title: "Profile"
  },

  {
    path: "" , component: LandingPage, title: 'Zenivo | Home'
  }

];
