import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorService } from 'src/app/error/error.service';
import { BookDetail, Category, DbHelperService } from 'src/app/shared/db-helper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  form! : FormGroup;
  books: BookDetail[] = [];
  chosenBook: BookDetail = null;
  categories: Category[] = [];
  isLoading = false;
  search = null;
  
  constructor(private dbHelperService: DbHelperService, private errorService: ErrorService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      'title': new FormControl(null),
      'desc': new FormControl(null),
      'quantity': new FormControl(null),
      'categoryId': new FormControl(null)
    });

    this.reloadData();
  }

  reloadData() {
    let booksResponse = null;
    this.isLoading = true;
    this.dbHelperService.getAllBooks().subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        booksResponse = resData;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      },
      () => {
        this.dbHelperService.getAllCategories().subscribe(
          resData => {
            this.errorService.errorHandling.next(null);
            this.categories = resData;
            this.books = this.dbHelperService.getAllBookDetails(booksResponse, resData);
            this.isLoading = false;
          },
          error => {
            this.errorService.errorHandling.next(error);
            this.isLoading = false;
          }
        );
      }
    );
  }

  onShowModal(book: BookDetail) {
    this.chosenBook = book;
    this.form.get('title').setValue(book.title);
    this.form.get('title').disable();
    this.form.get('desc').setValue(book.desc);
    this.form.get('desc').disable();
    this.form.get('quantity').setValue(book.quantity);
    this.form.get('quantity').disable();
    this.form.get('categoryId').setValue(book.category.id);
    this.form.get('categoryId').disable();
  }
}
