import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ErrorService } from 'src/app/error/error.service';
import { DbHelperService, UserDetail } from 'src/app/shared/db-helper.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  updateForm! : FormGroup;
  userSubscription: Subscription;
  loggedInUserId: string = null;
  users: UserDetail[] = [];
  chosenUser: UserDetail = null;
  isLoading = false;
  search = null;
  @ViewChild('btnClose') btnClose: ElementRef;
  
  constructor(private dbHelperService: DbHelperService, private errorService: ErrorService, private authService: AuthService) {}

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      'username': new FormControl(null, Validators.required),
      'role': new FormControl(null, Validators.required)
    });

    this.userSubscription = this.authService.userSubject.subscribe(
      user => {
        if(!!user){
          this.loggedInUserId = user.dbId;
        }
      }
    )

    this.reloadData();
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  reloadData() {
    this.isLoading = true;
    this.dbHelperService.getAllUserDetail().subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        this.users = resData;
        this.isLoading = false;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      }
    );
  }

  onShowUpdateModal(user: UserDetail) {
    this.chosenUser = user;
    this.updateForm.get('username').setValue(user.username);
    this.updateForm.get('role').setValue(user.role);
  }

  dismissUpdateModal() {
    this.btnClose.nativeElement.click();
  }

  onUpdate() {
    this.dismissUpdateModal();

    if(!this.updateForm.valid) {
      this.errorService.errorHandling.next("Please enter the correct inputs");
      return;
    }
    const username = this.updateForm.value.username;
    const role = this.updateForm.value.role;

    const user: UserDetail = {
      id: this.chosenUser.id,
      username: username,
      role: role,
      authId: this.chosenUser.authId,
      isDeleted: this.chosenUser.isDeleted
    };

    this.isLoading = true;
    this.dbHelperService.updateUserDetail(user).subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        this.reloadData();
        this.isLoading = false;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      }
    );
  }

  onDisable(user: UserDetail) {
    this.isLoading = true;
    this.dbHelperService.deleteUserDetail(user).subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        this.reloadData();
        this.isLoading = false;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      }
    );
  }
}
