import { HttpClient, HttpParams } from '@angular/common/http';
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
  categoryId: string,
  isDeleted: boolean
}

export interface BookDetail{
  id?: string,
  title: string,
  desc: string,
  category: Category,
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

  // getAllBookDetails(books: Book[]) {
  //   return this.getAllCategories()
  //   .pipe(
  //     map( categories => {
  //       const result: BookDetail[] = [];
  //       books.forEach( book => {
  //         result.push(
  //           {
  //             title: book.title,
  //             desc: book.desc,
  //             category: this.getCategoryById(categories, book.categoryId),
  //             isDeleted: book.isDeleted
  //           }
  //         );
  //       })
  //       return result;
  //     })
  //   );
  // }

  getAllBookDetails(books: Book[], categories: Category[]) {
    const result: BookDetail[] = [];
    books.forEach( book => {
      result.push(
        {
          id: book.id,
          title: book.title,
          desc: book.desc,
          category: this.getCategoryById(categories, book.categoryId),
          isDeleted: book.isDeleted
        }
      );
    })
    return result;
  }

  getBookById(id: string){
    // return this.getAllCategories()
    // .pipe(
    //   map( users => {
    //     let result = null;
    //     users.some( user => {
    //       // mirip foreach, return true untuk break dari loop
    //       if(user.authId === id) {
    //         result = user;
    //         return true;
    //       }
    //       return false;
    //     });
    //     return result;
    //   })
    // );
  }

  createBook(book : {
    title: string,
    desc: string,
    categoryId: string
  })
  {
    return this.httpClient.post<{ name: string }>(
      this.dbUrl + '/books.json',
      {
        title: book.title,
        desc: book.desc,
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
        categoryId: book.categoryId,
        isDeleted: true
      }
    }

    return this.httpClient.patch(this.dbUrl + '/books.json', data);
  }
  // ------------END-OF-BOOKS------------
}
