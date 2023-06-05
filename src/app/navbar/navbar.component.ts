import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  userSubscription: Subscription;
  username: string = null;
  role: string = null;
  email: string = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.userSubject.subscribe(
      user => {
        if(!!user){
          this.username = user.username;
          this.role = user.role;
          this.email = user.email;
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }
}
