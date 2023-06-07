import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserDetail{
  id?: string,
  username: string,
  role: string,
  authId: string,
  isDeleted: boolean
}

export interface Category{
  id?: string,
  name: string,
  desc: string,
  isDeleted: boolean
}

export interface Book{
  id?: string,
  title: string,
  desc: string,
  quantity: number,
  categoryId: string,
  isDeleted: boolean
}

export interface BookDetail{
  id?: string,
  title: string,
  desc: string,
  quantity: number,
  category: Category,
  isDeleted: boolean
}

export interface BookIssue{
  id?: string,
  borrowDate: number,
  dueDate: number,
  isReturned: boolean,
  finePerDay: number,
  revenue: number,
  userDetailId: string,
  bookId: string,
  isDeleted: boolean
}

export interface BookIssueDetail{
  id?: string,
  borrowDate: Date,
  dueDate: Date,
  isReturned: boolean,
  finePerDay: number,
  revenue: number,
  userDetail: UserDetail,
  book: Book,
  isDeleted: boolean
}

@Injectable({
  providedIn: 'root'
})
export class DbHelperService {
  dbUrl: string = environment.dbUrl;

  constructor(private httpClient: HttpClient) { }

  // ------------USERS------------
  getAllUserDetail(){
    return this.httpClient.get<{[key: string] : UserDetail}>(this.dbUrl + '/users.json')
    .pipe(
      map( responseData => {
        const users: UserDetail[] = [];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            users.push({...responseData[key], id: key})
          }
        }
        console.log(users);
        return users;
      })
    )
  }

  getUserDetailByAuthId(id: string){
    return this.getAllUserDetail()
    .pipe(
      map( users => {
        let result = null;
        users.some( user => {
          // mirip foreach, return true untuk break dari loop
          if(user.authId === id) {
            result = user;
            return true;
          }
          return false;
        });
        return result;
      })
    );
  }

  getUserDetailById(users: UserDetail[], id: string): UserDetail {
    let result: UserDetail = null;
    users.some( user => {
      if(user.id === id) {
        result = user;
        return true;
      }
      return false;
    })
    return result;
  }

  createUserDetail(userDetail : {
    authId: string,
    username: string
  })
  {
    return this.httpClient.post<{ name: string }>(
      this.dbUrl + '/users.json',
      {
        authId: userDetail.authId,
        username: userDetail.username,
        role: 'user',
        isDeleted: false
      }
    );
  }

  updateUserDetail(userDetail: UserDetail){
    const data = {
      [userDetail.id]:{
        authId: userDetail.authId,
        username: userDetail.username,
        role: userDetail.role,
        isDeleted: userDetail.isDeleted
      }
    }

    return this.httpClient.patch(this.dbUrl + '/users.json', data);
  }

  deleteUserDetail(userDetail: UserDetail){
    const data = {
      [userDetail.id]:{
        authId: userDetail.authId,
        username: userDetail.username,
        role: userDetail.role,
        isDeleted: true
      }
    }

    return this.httpClient.patch(this.dbUrl + '/users.json', data);
  }
  // ------------END-OF-USERS------------

  // ------------CATEGORIES------------
  getAllCategories(){
    return this.httpClient.get<{[key: string] : Category}>(this.dbUrl + '/categories.json')
    .pipe(
      map( responseData => {
        const categories: Category[] = [];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            categories.push({...responseData[key], id: key})
          }
        }
        console.log(categories);
        return categories;
      })
    )
  }

  getCategoryById(categories: Category[], id: string): Category {
    let result: Category = null;
    categories.some( category => {
      if(category.id === id) {
        result = category;
        return true;
      }
      return false;
    })
    return result;
  }

  createCategory(category : {
    name: string,
    desc: string
  })
  {
    return this.httpClient.post<{ name: string }>(
      this.dbUrl + '/categories.json',
      {
        name: category.name,
        desc: category.desc,
        isDeleted: false
      }
    );
  }

  updateCategory(category: Category){
    const data = {
      [category.id]:{
        name: category.name,
        desc: category.desc,
        isDeleted: category.isDeleted
      }
    }

    return this.httpClient.patch(this.dbUrl + '/categories.json', data);
  }

  deleteCategory(category: Category){
    const data = {
      [category.id]:{
        name: category.name,
        desc: category.desc,
        isDeleted: true
      }
    }

    return this.httpClient.patch(this.dbUrl + '/categories.json', data);
  }
  // ------------END-OF-CATEGORIES------------

  // ------------BOOKS------------
  getAllBooks(){
    return this.httpClient.get<{[key: string] : Book}>(this.dbUrl + '/books.json')
    .pipe(
      map( responseData => {
        const books: Book[] = [];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            books.push({...responseData[key], id: key})
          }
        }
        console.log(books);
        return books;
      })
    )
  }

  getAllBookDetails(books: Book[], categories: Category[]) {
    const result: BookDetail[] = [];
    books.forEach( book => {
      result.push(
        {
          id: book.id,
          title: book.title,
          desc: book.desc,
          quantity: book.quantity,
          category: this.getCategoryById(categories, book.categoryId),
          isDeleted: book.isDeleted
        }
      );
    })
    return result;
  }

  getBookById(books: Book[], id: string): Book {
    let result: Book = null;
    books.some( book => {
      if(book.id === id) {
        result = book;
        return true;
      }
      return false;
    })
    return result;
  }

  createBook(book : {
    title: string,
    desc: string,
    quantity: number,
    categoryId: string
  })
  {
    return this.httpClient.post<{ name: string }>(
      this.dbUrl + '/books.json',
      {
        title: book.title,
        desc: book.desc,
        quantity: book.quantity,
        categoryId: book.categoryId,
        isDeleted: false
      }
    );
  }

  updateBook(book: Book){
    const data = {
      [book.id]:{
        title: book.title,
        desc: book.desc,
        quantity: book.quantity,
        categoryId: book.categoryId,
        isDeleted: book.isDeleted
      }
    }

    return this.httpClient.patch(this.dbUrl + '/books.json', data);
  }

  deleteBook(book: Book){
    const data = {
      [book.id]:{
        title: book.title,
        desc: book.desc,
        quantity: book.quantity,
        categoryId: book.categoryId,
        isDeleted: true
      }
    }

    return this.httpClient.patch(this.dbUrl + '/books.json', data);
  }
  // ------------END-OF-BOOKS------------

  // ------------BOOK-ISSUES------------
  getAllBookIssues(){
    return this.httpClient.get<{[key: string] : BookIssue}>(this.dbUrl + '/book-issues.json')
    .pipe(
      map( responseData => {
        const bookIssue: BookIssue[] = [];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            bookIssue.push({...responseData[key], id: key})
          }
        }
        console.log(bookIssue);
        return bookIssue;
      })
    )
  }

  getAllBookIssueDetails(bookIssues: BookIssue[], users: UserDetail[], books: Book[]) {
    const result: BookIssueDetail[] = [];
    bookIssues.forEach( bookIssue => {
      result.push(
        {
          id: bookIssue.id,
          borrowDate: new Date(bookIssue.borrowDate),
          dueDate: new Date(bookIssue.dueDate),
          isReturned: bookIssue.isReturned,
          finePerDay: bookIssue.finePerDay,
          revenue: bookIssue.revenue,
          userDetail: this.getUserDetailById(users, bookIssue.userDetailId),
          book: this.getBookById(books, bookIssue.bookId),
          isDeleted: bookIssue.isDeleted
        }
      );
    })
    return result;
  }

  createBookIssue(bookIssue : {
    finePerDay: number,
    userDetailId: string,
    bookId: string,
  })
  {
    return this.httpClient.post<{ name: string }>(
      this.dbUrl + '/book-issues.json',
      {
        borrowDate: new Date().getTime(),
        dueDate: new Date().getTime() + 1209600000, // 2 weeks
        isReturned: false,
        finePerDay: bookIssue.finePerDay,
        revenue: 0,
        userDetailId: bookIssue.userDetailId,
        bookId: bookIssue.bookId,
        isDeleted: false
      }
    );
  }

  updateBookIssue(bookIssue: BookIssue){
    const data = {
      [bookIssue.id]:{
        borrowDate: bookIssue.borrowDate,
        dueDate: bookIssue.dueDate,
        isReturned: bookIssue.isReturned,
        finePerDay: bookIssue.finePerDay,
        revenue: bookIssue.revenue,
        userDetailId: bookIssue.userDetailId,
        bookId: bookIssue.bookId,
        isDeleted: bookIssue.isDeleted
      }
    }

    return this.httpClient.patch(this.dbUrl + '/book-issues.json', data);
  }

  deleteBookIssue(bookIssue: BookIssue){
    const data = {
      [bookIssue.id]:{
        borrowDate: bookIssue.borrowDate,
        dueDate: bookIssue.dueDate,
        isReturned: bookIssue.isReturned,
        finePerDay: bookIssue.finePerDay,
        revenue: bookIssue.revenue,
        userDetailId: bookIssue.userDetailId,
        bookId: bookIssue.bookId,
        isDeleted: true
      }
    }

    return this.httpClient.patch(this.dbUrl + '/book-issues.json', data);
  }
  // ------------END-OF-BOOK-ISSUES------------
}
