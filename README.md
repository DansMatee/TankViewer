# Tank Viewer
An AIO solution for viewing the status of tanks, managing Tank Principals, tariffs, wash costs and shipments.

## Languages
Main functionality is developed with Flask (Python), utilising Flasks render template to serve the frontend.
Database connectivity is developed with sqlalchemy.
Styling was done with tailwindcss, with responsiveness in mind.

## Functions
### User Features
#### Principals Page
- Create and Edit Tank Principals
- Filter by key parameters
- Add contacts and notes to each Principal

Many features are planned and being developed.
  
### Technical Features
- Passwords for accounts securely stored in a hashed and salted format, using werkzeug.
 
## Running locally
1. Clone the repository into a folder.
2. Create a virtual env with python ```python -m venv .venv```
3. Activate the virtual env ```.venv\Scripts\Activate```
4. Install the required packages ```pip install -r requirements.txt```
5. Configure database connection string in app.py, no need to execute a database sql file.
6. Run flask ```flask --app app run```
7. Navigate to http://localhost:5000/

## Design Mockups
The design of the web app was prototyped and then refined. Thanks to @ewanbryant for his contributions to the design aspect.
https://www.figma.com/design/8Qk0pUwnXntFcEl7MJYtA9/Tank-Viewer?node-id=0-1&t=mNzbWwz1AiwQlQBe-1

## Screenshots
- Principals Dashboard <br>
![image](https://github.com/user-attachments/assets/935b7e63-cc40-4b14-9fa9-22d891489a6f)

- Principal Item <br>
![image](https://github.com/user-attachments/assets/300d55a5-445d-4630-8ad2-4dd0ee8e22b0)

- Principal Item Contacts <br>
![image](https://github.com/user-attachments/assets/75f83f9c-92e6-4321-9576-9bd5ee5e6c97)

- New Principal Item <br>
![image](https://github.com/user-attachments/assets/90794016-fa33-4fef-97b7-fd829574e5ee)

- Fully expanded principal table <br>
![image](https://github.com/user-attachments/assets/fe62cfcb-8ed5-4d77-aff9-058c10298c22)














