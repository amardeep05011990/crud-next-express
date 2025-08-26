import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
courses = [
  { title: 'Mathematics', description: 'Build strong fundamentals in math.', image: 'assets/img/math.jpg' },
  { title: 'Science', description: 'Explore the wonders of science.', image: 'assets/img/science.jpg' },
  { title: 'Arts', description: 'Creative courses to inspire imagination.', image: 'assets/img/arts.jpg' }
];

}
