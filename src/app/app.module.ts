import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';
import { AuthComponent } from './auth/auth.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ErrorService } from './error/error.service';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { UserManagementComponent } from './home/user-management/user-management.component';
import { BookManagementComponent } from './home/book-management/book-management.component';
import { BookIssueManagementComponent } from './home/book-issue-management/book-issue-management.component';
import { FilterPipe } from './shared/filter.pipe';
import { NotDeletedPipe } from './shared/not-deleted.pipe';
import { CategoryManagementComponent } from './home/category-management/category-management.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ErrorComponent,
    AuthComponent,
    NavbarComponent,
    SidebarComponent,
    LoadingSpinnerComponent,
    DashboardComponent,
    UserManagementComponent,
    BookManagementComponent,
    BookIssueManagementComponent,
    FilterPipe,
    NotDeletedPipe,
    CategoryManagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [ErrorService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
