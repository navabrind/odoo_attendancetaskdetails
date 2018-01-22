{
    "name": "Attendance/Time Tracking With Task Details",
    "summary": "Attendance/Time Tracking With Task Details",
    "category": "Human Resources",
    "version": "1.0",
    "author": "Navabrind IT Solutions",
    "website": "https://www.navabrinditsolutions.com",
    "description": """Attendance/Time Tracking With Task Details upon Check In/Check Out""",
    "depends": ['base','web','hr_attendance'],
    "data": [
        'security/ir.model.access.csv',
        'views/hr_attendance.xml',
    ],
    'qweb': ['static/src/xml/attendance.xml'],
    'images':['images/Banner_Image.png'],
    "installable": True,
    "auto_install": False,
    "price": 0,
    "currency": "EUR",
    'license': 'AGPL-3'
}
