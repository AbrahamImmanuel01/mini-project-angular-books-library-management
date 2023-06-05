import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isAdmin = false;

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.authService.userSubject.subscribe(
      user => {
        this.isAdmin = (user.role === 'admin');
      }
    );
  }

  ngOnDestroy(): void {
    this.authService.userSubject.unsubscribe();
  }
}
