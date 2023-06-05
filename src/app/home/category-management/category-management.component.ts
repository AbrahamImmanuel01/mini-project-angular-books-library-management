import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/error/error.service';
import { Category, DbHelperService } from 'src/app/shared/db-helper.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  createForm! : FormGroup;
  updateForm! : FormGroup;
  categories: Category[] = [];
  chosenCategory: Category = null;
  isLoading = false;
  search = null;
  @ViewChild('btnCloseCreate') btnCloseCreate: ElementRef;
  @ViewChild('btnCloseUpdate') btnCloseUpdate: ElementRef;
  
  constructor(private dbHelperService: DbHelperService, private errorService: ErrorService) {}

  ngOnInit(): void {
    this.createForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'desc': new FormControl(null, Validators.required)
    });

    this.updateForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
      'desc': new FormControl(null, Validators.required)
    });

    this.reloadData();
  }

  reloadData() {
    this.isLoading = true;
    this.dbHelperService.getAllCategories().subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        this.categories = resData;
        this.isLoading = false;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      }
    );
  }

  dismissCreateModal() {
    this.btnCloseCreate.nativeElement.click();
  }

  onCreate() {
    this.dismissCreateModal();

    if(!this.createForm.valid) {
      this.errorService.errorHandling.next("Please enter the correct inputs");
      return;
    }
    const name = this.createForm.value.name;
    const desc = this.createForm.value.desc;

    const category = {
      name: name,
      desc: desc
    };

    this.isLoading = true;
    this.dbHelperService.createCategory(category).subscribe(
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

    this.createForm.reset();
  }

  onShowUpdateModal(category: Category) {
    this.chosenCategory = category;
    this.updateForm.get('name').setValue(category.name);
    this.updateForm.get('desc').setValue(category.desc);
  }

  dismissUpdateModal() {
    this.btnCloseUpdate.nativeElement.click();
  }

  onUpdate() {
    this.dismissUpdateModal();

    if(!this.updateForm.valid) {
      this.errorService.errorHandling.next("Please enter the correct inputs");
      return;
    }
    const name = this.updateForm.value.name;
    const desc = this.updateForm.value.desc;

    const category: Category = {
      id: this.chosenCategory.id,
      name: name,
      desc: desc,
      isDeleted: this.chosenCategory.isDeleted
    };

    this.isLoading = true;
    this.dbHelperService.updateCategory(category).subscribe(
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

    this.updateForm.reset();
  }

  onDelete(category: Category) {
    this.isLoading = true;
    this.dbHelperService.deleteCategory(category).subscribe(
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
