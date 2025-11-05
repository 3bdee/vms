# Violation-management-system
A complete Violation Management System for private schools built with React.js, Express.js, and MySQL. Tracks student violations, teachers, punishments, and generates printable violation reports.
# 🏫 Violation Management System

A full-featured Violation Management System designed for private schools to track and manage student violations, assigned punishments, responsible teachers, and more. Built with React.js (frontend), Express.js (backend), and MySQL (database).

---

## ✨ Features

- 📄 Record new student violations with time, level, and teacher details
- 🧑‍🏫 Manage violation types, teachers, and punishments
- 📊 Display all records in a searchable, sortable data grid
- 🗑️ Delete violation records
- 🖨️ Generate and print styled violation reports (with school logo)
- 📁 Add new violations dynamically if not already in database

---

## 🛠 Tech Stack

| Frontend        | Backend       | Database |
|----------------|---------------|----------|
| React.js        | Express.js     | MySQL    |
| Material UI     | Node.js        | XAMPP    |
| Axios           | body-parser    |          |

🗃️ Database Schema (Overview)=> 
Tables  [violationsystem.pdf](https://github.com/user-attachments/files/19726563/violationsystem.pdf)

students – first name, last name, level

violations – list of violation types

teachers – teacher names

punishments – punishment list

violation_records – complete records with references to above

![violation schema](https://github.com/user-attachments/assets/4537812e-304d-411a-924e-be4ab3615bb0)


🖨️ PDF Print Feature
Generates a clean, styled printable violation sheet per student, including logo and formatted date/time.

📄 License
This project is open-source and free to use under the MIT License.

🙌 Author :
Developed by Abdelmalek Eddiry
---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/violation-management-system.git
cd violation-management-system



