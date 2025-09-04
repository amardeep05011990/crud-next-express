// ========= LOGIN COMPONENT =========
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  errorMessage: string | null = null;
  nextUrl: string | null = null;

  ngOnInit() {
    this.nextUrl = this.route.snapshot.queryParamMap.get('next');
    console.log("this.nextUrl oninit", this.nextUrl)
  }

  submit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading = false;
        console.log("this.nextUrl", this.nextUrl)

        // redirect to next or home
        this.router.navigate([this.nextUrl || '/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
