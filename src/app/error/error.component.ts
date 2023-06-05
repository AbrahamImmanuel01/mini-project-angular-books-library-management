import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorService } from './error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {
  error = null;
  errorSubscription: Subscription;

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.errorSubscription = this.errorService.errorHandling.subscribe(
      error => {
        this.error = error;
      }
    );
  }

  ngOnDestroy(): void {
    this.errorSubscription.unsubscribe();
  }

  onCloseAlert() {
    this.error = null;
  }
}
