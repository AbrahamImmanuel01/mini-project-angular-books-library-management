import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/error/error.service';
import { Book, BookDetail, Category, DbHelperService } from 'src/app/shared/db-helper.service';

@Component({
  selector: 'app-book-management',
  templateUrl: './book-management.component.html',
  styleUrls: ['./book-management.component.css']
})
export class BookManagementComponent implements OnInit {
  createForm! : FormGroup;
  updateForm! : FormGroup;
  books: BookDetail[] = [];
  chosenBook: BookDetail = null;
  categories: Category[] = [];
  isLoading = false;
  search = null;
  @ViewChild('btnCloseCreate') btnCloseCreate: ElementRef;
  @ViewChild('btnCloseUpdate') btnCloseUpdate: ElementRef;
  
  constructor(private dbHelperService: DbHelperService, private errorService: ErrorService) {}

  ngOnInit(): void {
    this.createForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'desc': new FormControl(null, Validators.required),
      'categoryId': new FormControl(null, Validators.required)
    });

    this.updateForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'desc': new FormControl(null, Validators.required),
      'categoryId': new FormControl(null, Validators.required)
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

  dismissCreateModal() {
    this.btnCloseCreate.nativeElement.click();
  }

  onCreate() {
    this.dismissCreateModal();

    if(!this.createForm.valid) {
      this.errorService.errorHandling.next("Please enter the correct inputs");
      return;
    }
    const title = this.createForm.value.title;
    const desc = this.createForm.value.desc;
    const categoryId = this.createForm.value.categoryId;

    const book = {
      title: title,
      desc: desc,
      categoryId: categoryId
    };

    this.isLoading = true;
    this.dbHelperService.createBook(book).subscribe(
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

  onShowUpdateModal(book: BookDetail) {
    this.chosenBook = book;
    this.updateForm.get('title').setValue(book.title);
    this.updateForm.get('desc').setValue(book.desc);
    this.updateForm.get('categoryId').setValue(book.category.id);
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
    const title = this.updateForm.value.title;
    const desc = this.updateForm.value.desc;
    const categoryId = this.updateForm.value.categoryId;

    const book: Book = {
      id: this.chosenBook.id,
      title: title,
      desc: desc,
      categoryId: categoryId,
      isDeleted: this.chosenBook.isDeleted
    };

    this.isLoading = true;
    this.dbHelperService.updateBook(book).subscribe(
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

  onDelete(book: Book) {
    this.isLoading = true;
    this.dbHelperService.deleteBook(book).subscribe(
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
