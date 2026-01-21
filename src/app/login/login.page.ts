import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service'; 
import { Router } from '@angular/router'; // Import Router for navigation
import { IonicModule } from '@ionic/angular';  // Import IonicModule
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonicModule
  ]
})

export class LoginPage{

  mobile: string = '';
  password: string = '';
  errorMessage: string = '';
    
  constructor(private router: Router, private apiService:ApiService, private storageSerrvice:StorageService) { }

  onLogin(){

    this.errorMessage = ""

    this.apiService.login(this.mobile, this.password).subscribe(
      (response) => {
       
        if (response.success.status_code === 200) {
          const user = response.Users[0];
          
          this.storageSerrvice.set('user_data', user);
          this.storageSerrvice.set('selected_year', null);
          this.storageSerrvice.set('selected_stage', null);
  
          if(user.is_self_verified == 0){
            this.router.navigateByUrl('/registeration', { replaceUrl: true });  
          } else {
            this.router.navigateByUrl('/year-select', { replaceUrl: true });
          }
        } else{
          this.errorMessage = response.success.message;
        }
        

      },
      (error) => {
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    );

  }


}
