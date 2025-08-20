import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

    name= "";
    users = [{ id: 1, name: 'Alice' }];

    addUser(){
      console.log(this.name)
    }
}
