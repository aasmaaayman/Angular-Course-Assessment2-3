import { Component, OnInit,ViewChild,Inject} from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import {MatSliderModule} from '@angular/material/slider';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback } from '../shared/feedback';
import { visibility,flyInOut } from '../animations/app.animations';
@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
   visibility(),
   flyInOut()
  ]
  
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  todaydate:number = Date.now();
  dishIds: string[];
  prev: string;
  next: string;
  matSlider: MatSliderModule;
  feedbackForm: FormGroup;
  feedback: Feedback;
  errMess: string;
  dishcopy: Dish;
  visibility = 'shown';

  @ViewChild('fform') feedbackFormDirective;

   //form errors
   formErrors = {
    'name': '',
    'commentView': ''
  };
  //validation messages
  validationMessages = {
    'name': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'commentView': {
      'required':      'Comment is required.'
    },
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds,errmess => this.errMess = <any>errmess);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
  }
  goBack(): void {
    this.location.back();
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

 

  //create form
  createForm() {
    //Add Form Validation
    this.feedbackForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      commentView: ['', [Validators.required]],
      Stars: '',
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

 // can be found in form validation documentation in angular.io by steps
 onValueChanged(data?: any) {
  if (!this.feedbackForm) { return; }
  const form = this.feedbackForm;
  for (const field in this.formErrors) {
    if (this.formErrors.hasOwnProperty(field)) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            this.formErrors[field] += messages[key] + ' ';
          }
        }
      }
    }
  }
}

 //for submit button
  onSubmit() {
    this.dish.comments.push({
      rating: this.feedbackForm.get('Stars').value,
      comment:this.feedbackForm.get('commentView').value,
      author: this.feedbackForm.get('name').value,
      date: this.todaydate.toString()
    });
    this.feedback = this.feedbackForm.value;
    //this.dishcopy.comments.push(this.feedbackForm.value);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.feedbackForm.reset({
      name: '',
      commentView: '',
      Stars: ''
    });
    this.feedbackFormDirective.resetForm();
  }
}
