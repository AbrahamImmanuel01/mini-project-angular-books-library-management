import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from 'src/app/error/error.service';
import { Book, BookIssue, BookIssueDetail, DbHelperService, UserDetail } from 'src/app/shared/db-helper.service';

@Component({
  selector: 'app-book-issue-management',
  templateUrl: './book-issue-management.component.html',
  styleUrls: ['./book-issue-management.component.css']
})
export class BookIssueManagementComponent {
  createForm! : FormGroup;
  updateForm! : FormGroup;
  bookIssues: BookIssueDetail[] = [];
  chosenBookIssue: BookIssueDetail = null;
  users: UserDetail[] = [];
  books: Book[] = [];
  isLoading = false;
  search = null;
  @ViewChild('btnCloseCreate') btnCloseCreate: ElementRef;
  @ViewChild('btnCloseUpdate') btnCloseUpdate: ElementRef;
  
  constructor(private dbHelperService: DbHelperService, private errorService: ErrorService) {}

  ngOnInit(): void {
    this.createForm = new FormGroup({
      'userDetailId': new FormControl(null, Validators.required),
      'bookId': new FormControl(null, Validators.required),
      'finePerDay': new FormControl(null, Validators.required)
    });

    this.reloadData();
  }

  reloadData() {
    let bookIssuesResponse = null;
    this.isLoading = true;

    // get all book issues
    this.dbHelperService.getAllBookIssues().subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
        bookIssuesResponse = resData;
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      },
      () => {
        // get all users
        this.dbHelperService.getAllUserDetail().subscribe(
          resData => {
            this.errorService.errorHandling.next(null);
            this.users = resData;
          },
          error => {
            this.errorService.errorHandling.next(error);
            this.isLoading = false;
          },
          () => {
            // get all books
            this.dbHelperService.getAllBooks().subscribe(
              resData => {
                this.errorService.errorHandling.next(null);
                this.books = resData;
                this.bookIssues = this.dbHelperService.getAllBookIssueDetails(bookIssuesResponse, this.users, resData);
                this.bookIssues.forEach(bookIssue => {
                  bookIssue.revenue = this.calculateRevenue(
                    bookIssue.isReturned,
                    bookIssue.revenue,
                    bookIssue.dueDate,
                    bookIssue.finePerDay
                  )
                });
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
    const userDetailId = this.createForm.value.userDetailId;
    const bookId = this.createForm.value.bookId;
    const finePerDay = this.createForm.value.finePerDay;

    const bookIssue = {
      userDetailId: userDetailId,
      bookId: bookId,
      finePerDay: finePerDay
    };

    this.isLoading = true;
    this.dbHelperService.createBookIssue(bookIssue).subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      },
      () => {
        // update book quantity
        let book = this.dbHelperService.getBookById(this.books, bookId);
        book.quantity = book.quantity - 1;
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
      }
    );

    this.createForm.reset();
  }

  onReturn(bookIssueDetail: BookIssueDetail){
    const bookIssue: BookIssue = {
      id: bookIssueDetail.id,
      borrowDate: bookIssueDetail.borrowDate.getTime(),
      dueDate: bookIssueDetail.dueDate.getTime(),
      returnDate: new Date().getTime(),
      isReturned: true,
      finePerDay: bookIssueDetail.finePerDay,
      revenue: bookIssueDetail.revenue,
      userDetailId: bookIssueDetail.userDetail.id,
      bookId: bookIssueDetail.book.id,
      isDeleted: bookIssueDetail.isDeleted
    };

    this.isLoading = true;
    this.dbHelperService.updateBookIssue(bookIssue).subscribe(
      resData => {
        this.errorService.errorHandling.next(null);
      },
      error => {
        this.errorService.errorHandling.next(error);
        this.isLoading = false;
      },
      () => {
        // update book quantity
        bookIssueDetail.book.quantity = bookIssueDetail.book.quantity + 1;
        this.dbHelperService.updateBook(bookIssueDetail.book).subscribe(
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
    );
  }

  onDelete(bookIssueDetail: BookIssueDetail) {
    const bookIssue: BookIssue = {
      id: bookIssueDetail.id,
      borrowDate: bookIssueDetail.borrowDate.getTime(),
      dueDate: bookIssueDetail.dueDate.getTime(),
      returnDate: bookIssueDetail.returnDate.getDate(),
      isReturned: bookIssueDetail.isReturned,
      finePerDay: bookIssueDetail.finePerDay,
      revenue: bookIssueDetail.revenue,
      userDetailId: bookIssueDetail.userDetail.id,
      bookId: bookIssueDetail.book.id,
      isDeleted: true
    };

    this.isLoading = true;
    this.dbHelperService.deleteBookIssue(bookIssue).subscribe(
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

  isLate(dueDate: Date) {
    return new Date() > dueDate;
  }

  calculateRevenue(isReturned: boolean, revenue: number, dueDate: Date, finePerDay: number) {
    if(isReturned){
      return revenue;
    }

    if(!this.isLate(dueDate)) {
      return 0;
    }

    let numOfDaysOverdue: number = (new Date().getTime() - dueDate.getTime()) / 86400000; // 1 day
    numOfDaysOverdue = Math.round(numOfDaysOverdue);

    return finePerDay * numOfDaysOverdue;
  }
}
