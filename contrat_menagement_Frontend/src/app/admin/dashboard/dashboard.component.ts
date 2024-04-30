import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, interval, throwError } from 'rxjs';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  EmployeeArray: any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;
  contractsCloseToCompletionCount = 0;
  expiredContracts: any[] = [];
  searchKeyword: string = '';

  employee: string = '';
  email: string = '';
  phone_number: string = '';
  personal_number: string = '';
  job_position: string = '';
  contract: string = '';
  start_date: string = '';
  end_date: string = '';
  currentEmployeeID = '';

  constructor(private router: Router, private http: HttpClient) {
    this.getAllEmployee();

    // Inside the constructor or ngOnInit method
    const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    interval(twentyFourHoursInMilliseconds).subscribe(() => {
      this.sendEmail();
    });
  }

  ngOnInit(): void {
    this.getAllEmployee();
    this.updatePagedArray();
    this.calculateContractsCloseToCompletion();
    this.calculateExpiredContracts();
  }

  getAllEmployee() {
    this.http.get("http://localhost:8084/api/users_table/")
      .subscribe((resultData: any) => {
        this.isResultLoaded = true;
        console.log(resultData.data);
        this.EmployeeArray = resultData.data;
        this.updatePagedArray();
        this.calculateContractsCloseToCompletion();
        this.calculateExpiredContracts();
      });
  }

  calculateContractsCloseToCompletion() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current time to the start of the day

    this.contractsCloseToCompletionCount = this.EmployeeArray.reduce((count, employee) => {
      const endDate = new Date(employee.end_date);
      const timeDifference = endDate.getTime() - currentDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      if (daysDifference <= 3 && daysDifference > 0) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  calculateExpiredContracts() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current time to the start of the day

    this.expiredContracts = this.EmployeeArray.filter(employee => {
      const endDate = new Date(employee.end_date);
      return endDate < currentDate;
    });
  }


  search(): void {
    if (this.searchKeyword.trim() !== '') {
        this.pagedEmployeeArray = this.EmployeeArray.filter(employee =>
            employee.employee.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
    } else {
        // If search keyword is empty, display all users
        this.updatePagedArray();
    }
}



  register() {
    let bodyData = {
      "employee": this.employee,
      "email": this.email,
      "phone_number": this.phone_number,
      "personal_number": this.personal_number,
      "job_position": this.job_position,
      "contract": this.contract,
      "start_date": this.start_date,
      "end_date": this.end_date,
    };

    this.http.post("http://localhost:8084/api/users_table/add", bodyData)
      .pipe(
        catchError(error => {
          console.error('Error registering student:', error);
          return throwError(error);
        })
      )
      .subscribe((resultData: any) => {
        console.log(resultData);
        alert(`Student Register Successfully`);
        this.getAllEmployee();
        // Clear form data
        this.clearFormData();
        // Show the table
        this.showTable = true;
        // Update paged array
        this.updatePagedArray();
        // Hide the form
        this.showForm = false;
      });
  }

  setUpdate(data: any) {
    this.employee = data.employee;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.personal_number = data.personal_number;
    this.job_position = data.job_position;
    this.contract = data.contract;

    // Convert start_date and end_date strings to Date objects
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    // Format the dates as "yyyy-MM-dd"
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);

    // Assign the formatted dates to the component properties
    this.start_date = formattedStartDate;
    this.end_date = formattedEndDate;

    this.currentEmployeeID = data.id;
    // Show the form when editing
    this.showForm = true;
    this.showTable = false;
  }

  // Helper function to format date as "yyyy-MM-dd"
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed

    return `${year}-${month}-${day}`;
  }



  updateRecords() {
    let bodyData = {
      "employee": this.employee,
      "email": this.email,
      "phone_number": this.phone_number,
      "personal_number": this.personal_number,
      "job_position": this.job_position,
      "contract": this.contract,
      "start_date": this.start_date,
      "end_date": this.end_date,
    };

    this.http.put("http://localhost:8084/api/users_table/update" + "/" + this.currentEmployeeID, bodyData)
      .subscribe((resultData: any) => {
        console.log(resultData);
        alert(`Student Updated successfully`);
        this.getAllEmployee();
        // Close the form after updating
        this.showForm = false;
      });
  }

  save() {
    if (this.currentEmployeeID === '') {
      this.register();
    } else {
      this.updateRecords();
    }
    // Clear form data
    this.clearFormData();
    // Show the table
    this.showTable = true;
    // Update paged array
    this.updatePagedArray();
  }

  clearFormData() {
    this.employee = '';
    this.email = '';
    this.phone_number = '';
    this.personal_number = '';
    this.job_position = '';
    this.contract = '';
    this.start_date = '';
    this.end_date = '';
    this.currentEmployeeID = '';
  }



  setDelete(data: any) {
    this.http.delete("http://localhost:8084/api/users_table/delete" + "/" + data.id)
      .subscribe((resultData) => {
        console.log(resultData);
        alert(`Student Deleted Successfully`);
        this.getAllEmployee();
      });
  }

  logout(): void {
    // Perform logout actions here, such as clearing session data
    // Redirect to login component
    this.router.navigate(['/Login']);
  }

  // Other component properties

  showForm: boolean = false;
  showTable: boolean = true;

  // Method to toggle the visibility of the form
  toggleFormVisibility() {
    this.showForm = !this.showForm; // Toggle the form visibility
    this.showTable = false; // Ensure the table is hidden when showing the form
  }


  // Method to close the form
  closeForm() {
    this.showForm = false;
  }

  // Method to handle going back
  goBack() {
    // Close the form when going back
    this.closeForm();
    // Clear form data
    this.clearFormData();
    // Show the table
    this.showTable = true;
    // Update paged array
    this.updatePagedArray();
    // Handle other go back logic if needed
  }



  // pagination

  // Inside the DashboardComponent class

  pageSize = 10; // Number of items per page
  pageIndex = 1; // Current page index
  pagedEmployeeArray: any[] = []; // Array to hold the paged items


  // Inside the DashboardComponent class
  updatePagedArray(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.EmployeeArray.length);

    console.log("Start Index:", startIndex);
    console.log("End Index:", endIndex);
    console.log("Total Length:", this.EmployeeArray.length);

    this.pagedEmployeeArray = this.EmployeeArray.slice(startIndex, endIndex);
  }

  // Method to handle page change event
  pageChanged(event: any): void {
    this.pageIndex = event.pageIndex + 1; // +1 to match 1-based indexing
    this.updatePagedArray(); // Update paged array when page changes
  }






  // email




  sendEmail() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current time to the start of the day

    const approachingEmployees: any[] = [];

    // Iterate through the EmployeeArray
    this.EmployeeArray.forEach((employee) => {
      // Parse the end_date string to a Date object
      const endDate = new Date(employee.end_date);

      // Calculate the difference in milliseconds between current date and end date
      const timeDifference = endDate.getTime() - currentDate.getTime();

      // Convert milliseconds to days
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

      // Check if the difference is less than or equal to 3 days and greater than 0
      if (daysDifference <= 3 && daysDifference > 0) {
        // Add the employee to the approachingEmployees array
        approachingEmployees.push({ employee, daysDifference });
      }
    });

    // Check if there are approaching employees
    if (approachingEmployees.length > 0) {
      let message = `The end date for the following members is approaching:\n`;
      approachingEmployees.forEach((approachingEmployee, index) => {
        const { employee, daysDifference } = approachingEmployee;
        message += `${index + 1}. ${employee.employee} - ${daysDifference} day(s) left\n`; // Include the name and days left of each approaching employee
      });

      // Construct templateParams object for sending email
      const templateParams = {
        to_email: 'recipient@example.com', // Replace with recipient's email
        message: message
      };

      // Send email using EmailJS
      emailjs.send('service_0ezhvzs', 'template_jf9wyjy', templateParams, 'EJs1G7wYiFHwHx_-d')
        .then((response) => {
          console.log('Email sent successfully:', response);
          alert('Email sent successfully!');
        }, (error) => {
          console.error('Email sending failed:', error);
        });
    }
  }

  ////export

  exportTotalContractsToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.EmployeeArray);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'total_contracts.xlsx');
  }

  exportCloseToCompletionContractsToExcel(): void {
    const closeToCompletionContracts = this.EmployeeArray.filter(employee => {
      // Add your condition to filter employees with contracts close to completion
      // For example, filter employees with contracts ending within 3 days
      const endDate = new Date(employee.end_date);
      const currentDate = new Date();
      const timeDifference = endDate.getTime() - currentDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      return daysDifference <= 3 && daysDifference > 0;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(closeToCompletionContracts);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'close_to_completion_contracts.xlsx');
  }

  exportExpiredContractsToExcel(): void {
    const expiredContractsData = this.expiredContracts.map(expiredContract => {
      return {
        'Employee': expiredContract.employee,
        'Expired On': expiredContract.end_date
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(expiredContractsData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'expired_contracts.xlsx');
  }


}
