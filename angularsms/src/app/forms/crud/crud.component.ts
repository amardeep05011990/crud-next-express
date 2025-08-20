import { Component, OnInit } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crud',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.scss'
})
export class CrudComponent implements OnInit {
  regForm: FormGroup;
  isdisable: Boolean = false;
  constructor(private fb: FormBuilder){
   this.regForm = this.fb.group({
    name:['', Validators.required],
    age:[''],
    email:[''],
    skills:  this.fb.array([]),
    address: this.fb.array([])
   })

  }

  ngOnInit() {
  }

  onsave(){
        if (this.regForm.invalid) {
      this.regForm.markAllAsTouched(); // ✅ highlight all errors
      return;
    }
    // this.isdisable= false;
    // this.regForm.disable()
    console.log(this.regForm)

    console.log(this.regForm.value)
  }
  get skills(): FormArray{
    return this.regForm.get('skills') as FormArray
  }
  addskills(){
    this.skills.push(this.fb.control('',  Validators.required))
  }

  removeSkills(index: Number){
    this.skills.removeAt(Number(index))
  }

  addAddress(){
    this.address.push(this.fb.group({
      city: [''],
      pincode: ['']
    }))
  }

  get address(): FormArray{
    return this.regForm.get('address') as FormArray
  }

  removeaddress(i: Number){
    this.address.removeAt(Number(i))
  }

}
