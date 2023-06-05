import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.css',
    '../../node_modules/admin-lte/plugins/fontawesome-free/css/all.min.css',
    '../../node_modules/admin-lte/plugins/icheck-bootstrap/icheck-bootstrap.min.css',
    '../../node_modules/admin-lte/dist/css/adminlte.min.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'ProjectTraining';

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
