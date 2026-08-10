"""
Django management command to create sample data for the eTutor application.
Run with: python manage.py create_sample_data
"""
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from commons.authentication.models import CustomUser, Group, GroupPermission, EducationLevel, EducationalBackground, Experience
from applications.category.models import Category
from applications.course.models import Course, Enrollement, Course_Cart, Reviewer
from applications.tutor.models import Tutor, Subject, Grade, Location, TutorContract
from applications.chapters.models import Chapter
from applications.content.models import Content
from commons.utils.enums import (
    GenderType, LanguageType, ActionStatus, COURSE_TYPE, COURSE_LEVEL, 
    COURSE_STATUS, RATING_VALUES, TutorStatus, LocationType, ContractStatus,
    EDUCATIONAL_LEVEL
)
from django.utils import timezone
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Creates sample data including students, tutors, admin, categories, courses, and more'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to create sample data...'))
        
        # Create Groups
        self.create_groups()
        
        # Create Users
        admin_user = self.create_admin()
        tutor_users = self.create_tutors()
        student_users = self.create_students()
        
        # Create Categories
        categories = self.create_categories()
        
        # Create Education Levels
        education_levels = self.create_education_levels()
        
        # Create Locations
        locations = self.create_locations()
        
        # Create Grades
        grades = self.create_grades()
        
        # Create Subjects
        subjects = self.create_subjects(categories)
        
        # Create Tutors
        tutors = self.create_tutor_profiles(tutor_users, locations, grades, subjects)
        
        # Create Courses
        courses = self.create_courses(categories, tutor_users)
        
        # Create Chapters and Content
        self.create_chapters_and_content(courses)
        
        # Create Enrollments
        self.create_enrollments(courses, student_users)
        
        # Create Reviews
        self.create_reviews(courses, student_users)
        
        # Create Educational Backgrounds
        self.create_educational_backgrounds(student_users + tutor_users, education_levels)
        
        self.stdout.write(self.style.SUCCESS('\n✓ Sample data created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'\nCreated:'))
        self.stdout.write(f'  - 1 Admin user (username: admin, password: admin123)')
        self.stdout.write(f'  - {len(tutor_users)} Tutor users')
        self.stdout.write(f'  - {len(student_users)} Student users')
        self.stdout.write(f'  - {len(categories)} Categories')
        self.stdout.write(f'  - {len(courses)} Courses')
        self.stdout.write(f'  - {len(tutors)} Tutor profiles')
        self.stdout.write(f'  - {len(subjects)} Subjects')
        self.stdout.write(f'  - {len(grades)} Grades')
        self.stdout.write(f'  - {len(locations)} Locations')

    def create_groups(self):
        """Create user groups"""
        self.stdout.write('Creating groups...')
        
        groups_data = [
            {'name': 'Admin', 'description': 'Administrator group'},
            {'name': 'Tutor', 'description': 'Tutor/Instructor group'},
            {'name': 'Student', 'description': 'Student group'},
        ]
        
        created_groups = []
        for group_data in groups_data:
            group, created = Group.objects.get_or_create(
                name=group_data['name'],
                defaults={'name': group_data['name']}
            )
            created_groups.append(group)
            if created:
                self.stdout.write(f'  ✓ Created group: {group.name}')
        
        return created_groups

    def create_admin(self):
        """Create admin user"""
        self.stdout.write('Creating admin user...')
        
        admin_group = Group.objects.get(name='Admin')
        
        admin, created = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'first_name': 'Admin',
                'middle_name': 'System',
                'last_name': 'User',
                'email': 'admin@etutor.com',
                'phone_number': '+251911000001',
                'gender': GenderType.MALE,
                'lang': LanguageType.ENGLISH,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        
        if created:
            admin.set_password('admin123')
            admin.save()
            admin.groups.add(admin_group)
            self.stdout.write(f'  ✓ Created admin: {admin.username} (password: admin123)')
        else:
            self.stdout.write(f'  - Admin already exists: {admin.username}')
        
        return admin

    def create_tutors(self):
        """Create tutor users"""
        self.stdout.write('Creating tutor users...')
        
        tutor_group = Group.objects.get(name='Tutor')
        tutors_data = [
            {
                'username': 'tutor1', 'first_name': 'John', 'middle_name': 'Michael',
                'last_name': 'Smith', 'email': 'tutor1@etutor.com',
                'phone': '+251911000002', 'gender': GenderType.MALE,
                'bio': 'Experienced mathematics tutor with 10 years of teaching experience.'
            },
            {
                'username': 'tutor2', 'first_name': 'Sarah', 'middle_name': 'Elizabeth',
                'last_name': 'Johnson', 'email': 'tutor2@etutor.com',
                'phone': '+251911000003', 'gender': GenderType.FEMALE,
                'bio': 'Physics instructor specializing in quantum mechanics and thermodynamics.'
            },
            {
                'username': 'tutor3', 'first_name': 'David', 'middle_name': 'Robert',
                'last_name': 'Williams', 'email': 'tutor3@etutor.com',
                'phone': '+251911000004', 'gender': GenderType.MALE,
                'bio': 'Chemistry expert with a passion for organic chemistry and lab work.'
            },
            {
                'username': 'tutor4', 'first_name': 'Emily', 'middle_name': 'Anne',
                'last_name': 'Brown', 'email': 'tutor4@etutor.com',
                'phone': '+251911000005', 'gender': GenderType.FEMALE,
                'bio': 'English literature and language tutor with expertise in creative writing.'
            },
            {
                'username': 'tutor5', 'first_name': 'Michael', 'middle_name': 'James',
                'last_name': 'Davis', 'email': 'tutor5@etutor.com',
                'phone': '+251911000006', 'gender': GenderType.MALE,
                'bio': 'Computer science instructor specializing in programming and algorithms.'
            },
        ]
        
        created_tutors = []
        for tutor_data in tutors_data:
            tutor, created = CustomUser.objects.get_or_create(
                username=tutor_data['username'],
                defaults={
                    'first_name': tutor_data['first_name'],
                    'middle_name': tutor_data['middle_name'],
                    'last_name': tutor_data['last_name'],
                    'email': tutor_data['email'],
                    'phone_number': tutor_data['phone'],
                    'gender': tutor_data['gender'],
                    'lang': LanguageType.ENGLISH,
                    'bio': tutor_data['bio'],
                    'is_active': True,
                }
            )
            
            if created:
                tutor.set_password('tutor123')
                tutor.save()
                tutor.groups.add(tutor_group)
                created_tutors.append(tutor)
                self.stdout.write(f'  ✓ Created tutor: {tutor.username} (password: tutor123)')
            else:
                created_tutors.append(tutor)
                self.stdout.write(f'  - Tutor already exists: {tutor.username}')
        
        return created_tutors

    def create_students(self):
        """Create student users"""
        self.stdout.write('Creating student users...')
        
        student_group = Group.objects.get(name='Student')
        students_data = [
            {
                'username': 'student1', 'first_name': 'Alice', 'middle_name': 'Marie',
                'last_name': 'Wilson', 'email': 'student1@etutor.com',
                'phone': '+251911000010', 'gender': GenderType.FEMALE
            },
            {
                'username': 'student2', 'first_name': 'Bob', 'middle_name': 'Thomas',
                'last_name': 'Martinez', 'email': 'student2@etutor.com',
                'phone': '+251911000011', 'gender': GenderType.MALE
            },
            {
                'username': 'student3', 'first_name': 'Charlie', 'middle_name': 'Daniel',
                'last_name': 'Anderson', 'email': 'student3@etutor.com',
                'phone': '+251911000012', 'gender': GenderType.MALE
            },
            {
                'username': 'student4', 'first_name': 'Diana', 'middle_name': 'Grace',
                'last_name': 'Taylor', 'email': 'student4@etutor.com',
                'phone': '+251911000013', 'gender': GenderType.FEMALE
            },
            {
                'username': 'student5', 'first_name': 'Ethan', 'middle_name': 'Paul',
                'last_name': 'Thomas', 'email': 'student5@etutor.com',
                'phone': '+251911000014', 'gender': GenderType.MALE
            },
            {
                'username': 'student6', 'first_name': 'Fiona', 'middle_name': 'Rose',
                'last_name': 'Jackson', 'email': 'student6@etutor.com',
                'phone': '+251911000015', 'gender': GenderType.FEMALE
            },
            {
                'username': 'student7', 'first_name': 'George', 'middle_name': 'William',
                'last_name': 'White', 'email': 'student7@etutor.com',
                'phone': '+251911000016', 'gender': GenderType.MALE
            },
            {
                'username': 'student8', 'first_name': 'Hannah', 'middle_name': 'Jane',
                'last_name': 'Harris', 'email': 'student8@etutor.com',
                'phone': '+251911000017', 'gender': GenderType.FEMALE
            },
        ]
        
        created_students = []
        for student_data in students_data:
            student, created = CustomUser.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'first_name': student_data['first_name'],
                    'middle_name': student_data['middle_name'],
                    'last_name': student_data['last_name'],
                    'email': student_data['email'],
                    'phone_number': student_data['phone'],
                    'gender': student_data['gender'],
                    'lang': LanguageType.ENGLISH,
                    'is_active': True,
                }
            )
            
            if created:
                student.set_password('student123')
                student.save()
                student.groups.add(student_group)
                created_students.append(student)
                self.stdout.write(f'  ✓ Created student: {student.username} (password: student123)')
            else:
                created_students.append(student)
                self.stdout.write(f'  - Student already exists: {student.username}')
        
        return created_students

    def create_categories(self):
        """Create course categories"""
        self.stdout.write('Creating categories...')
        
        categories_data = [
            {'name': 'Mathematics', 'description': 'Math courses and tutorials'},
            {'name': 'Science', 'description': 'Science courses including physics, chemistry, biology'},
            {'name': 'Computer Science', 'description': 'Programming and computer science courses'},
            {'name': 'Languages', 'description': 'Language learning courses'},
            {'name': 'Business', 'description': 'Business and management courses'},
            {'name': 'Arts', 'description': 'Arts and creative courses'},
        ]
        
        created_categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                category_name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'pinned': False,
                }
            )
            created_categories.append(category)
            if created:
                self.stdout.write(f'  ✓ Created category: {category.category_name}')
        
        return created_categories

    def create_education_levels(self):
        """Create education levels"""
        self.stdout.write('Creating education levels...')
        
        levels = []
        for level_value, level_label in EDUCATIONAL_LEVEL.choices:
            level_name = level_label.replace('_', ' ').title()
            level, created = EducationLevel.objects.get_or_create(
                educationlevel_name=level_name,
                defaults={'description': f'{level_name} level education'}
            )
            levels.append(level)
            if created:
                self.stdout.write(f'  ✓ Created education level: {level.educationlevel_name}')
        
        return levels

    def create_locations(self):
        """Create locations"""
        self.stdout.write('Creating locations...')
        
        locations_data = [
            {'address': 'Addis Ababa', 'type': LocationType.REGION},
            {'address': 'Bahir Dar', 'type': LocationType.REGION},
            {'address': 'Hawassa', 'type': LocationType.REGION},
            {'address': 'Mekelle', 'type': LocationType.REGION},
        ]
        
        created_locations = []
        for loc_data in locations_data:
            location, created = Location.objects.get_or_create(
                address=loc_data['address'],
                defaults={
                    'location_type': loc_data['type'],
                }
            )
            created_locations.append(location)
            if created:
                self.stdout.write(f'  ✓ Created location: {location.address}')
        
        return created_locations

    def create_grades(self):
        """Create grades"""
        self.stdout.write('Creating grades...')
        
        grades_data = [
            {'name': 'Grade 1-4', 'description': 'Elementary grades 1-4'},
            {'name': 'Grade 5-8', 'description': 'Middle school grades 5-8'},
            {'name': 'Grade 9-10', 'description': 'High school grades 9-10'},
            {'name': 'Grade 11-12', 'description': 'Preparatory grades 11-12'},
        ]
        
        created_grades = []
        for grade_data in grades_data:
            grade, created = Grade.objects.get_or_create(
                grade_name=grade_data['name'],
                defaults={'description': grade_data['description']}
            )
            created_grades.append(grade)
            if created:
                self.stdout.write(f'  ✓ Created grade: {grade.grade_name}')
        
        return created_grades

    def create_subjects(self, categories):
        """Create subjects"""
        self.stdout.write('Creating subjects...')
        
        subjects_data = [
            {'name': 'Algebra', 'categories': ['Mathematics']},
            {'name': 'Calculus', 'categories': ['Mathematics']},
            {'name': 'Physics', 'categories': ['Science']},
            {'name': 'Chemistry', 'categories': ['Science']},
            {'name': 'Biology', 'categories': ['Science']},
            {'name': 'Python Programming', 'categories': ['Computer Science']},
            {'name': 'Web Development', 'categories': ['Computer Science']},
            {'name': 'English', 'categories': ['Languages']},
            {'name': 'Amharic', 'categories': ['Languages']},
        ]
        
        created_subjects = []
        for subj_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                subject_name=subj_data['name'],
                defaults={'description': f'{subj_data["name"]} subject'}
            )
            
            if created:
                # Add categories to subject
                for cat_name in subj_data['categories']:
                    try:
                        category = Category.objects.get(category_name=cat_name)
                        subject.category.add(category)
                    except Category.DoesNotExist:
                        pass
                
                created_subjects.append(subject)
                self.stdout.write(f'  ✓ Created subject: {subject.subject_name}')
            else:
                created_subjects.append(subject)
        
        return created_subjects

    def create_tutor_profiles(self, tutor_users, locations, grades, subjects):
        """Create tutor profiles"""
        self.stdout.write('Creating tutor profiles...')
        
        created_tutors = []
        for i, tutor_user in enumerate(tutor_users):
            tutor, created = Tutor.objects.get_or_create(
                tutor=tutor_user,
                defaults={
                    'hourly_rate': random.randint(200, 1000),
                    'location': locations[i % len(locations)] if locations else None,
                    'introduction': f'Experienced tutor in various subjects. {tutor_user.bio or ""}',
                    'status': ActionStatus.APPROVED,
                    'is_active': True,
                    'average_rate_value': round(random.uniform(3.5, 5.0), 1),
                    'no_of_review': random.randint(5, 50),
                }
            )
            
            if created:
                # Add grades and subjects
                tutor.tutor_type.add(grades[i % len(grades)])
                tutor.preferred_subject.add(subjects[i % len(subjects)])
                if len(subjects) > i + 1:
                    tutor.preferred_subject.add(subjects[(i + 1) % len(subjects)])
                
                created_tutors.append(tutor)
                self.stdout.write(f'  ✓ Created tutor profile for: {tutor_user.username}')
            else:
                created_tutors.append(tutor)
        
        return created_tutors

    def create_courses(self, categories, tutor_users):
        """Create courses"""
        self.stdout.write('Creating courses...')
        
        courses_data = [
            {
                'name': 'Introduction to Algebra',
                'code': 'MATH101',
                'price': 0.0,
                'type': COURSE_TYPE.FREE,
                'level': COURSE_LEVEL.BEGINNER,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Learn the fundamentals of algebra',
                'category': 'Mathematics',
                'image': 'https://via.placeholder.com/400x300?text=Algebra',
            },
            {
                'name': 'Advanced Calculus',
                'code': 'MATH301',
                'price': 1500.0,
                'type': COURSE_TYPE.PREMIUM,
                'level': COURSE_LEVEL.ADVANCED,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Advanced calculus concepts and applications',
                'category': 'Mathematics',
                'image': 'https://via.placeholder.com/400x300?text=Calculus',
            },
            {
                'name': 'Physics Fundamentals',
                'code': 'PHYS101',
                'price': 1200.0,
                'type': COURSE_TYPE.PREMIUM,
                'level': COURSE_LEVEL.BEGINNER,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Introduction to physics principles',
                'category': 'Science',
                'image': 'https://via.placeholder.com/400x300?text=Physics',
            },
            {
                'name': 'Python for Beginners',
                'code': 'CS101',
                'price': 2000.0,
                'type': COURSE_TYPE.PREMIUM,
                'level': COURSE_LEVEL.BEGINNER,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Learn Python programming from scratch',
                'category': 'Computer Science',
                'image': 'https://via.placeholder.com/400x300?text=Python',
            },
            {
                'name': 'Web Development Bootcamp',
                'code': 'CS201',
                'price': 2500.0,
                'type': COURSE_TYPE.PREMIUM,
                'level': COURSE_LEVEL.INTERMEDIATE,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Full-stack web development course',
                'category': 'Computer Science',
                'image': 'https://via.placeholder.com/400x300?text=Web+Dev',
            },
            {
                'name': 'English Grammar',
                'code': 'LANG101',
                'price': 800.0,
                'type': COURSE_TYPE.PREMIUM,
                'level': COURSE_LEVEL.BEGINNER,
                'status': COURSE_STATUS.PUBLISHED,
                'description': 'Master English grammar rules',
                'category': 'Languages',
                'image': 'https://via.placeholder.com/400x300?text=English',
            },
        ]
        
        created_courses = []
        for i, course_data in enumerate(courses_data):
            try:
                category = Category.objects.get(category_name=course_data['category'])
            except Category.DoesNotExist:
                category = categories[0] if categories else None
            
            course, created = Course.objects.get_or_create(
                course_code=course_data['code'],
                defaults={
                    'name': course_data['name'],
                    'course_image': course_data['image'],
                    'course_price': course_data['price'],
                    'course_type': course_data['type'],
                    'course_level': course_data['level'],
                    'course_status': course_data['status'],
                    'description': course_data['description'],
                }
            )
            
            if created:
                course.category.add(category)
                # Assign tutors to courses
                tutor_index = i % len(tutor_users)
                course.instructor.add(tutor_users[tutor_index])
                if len(tutor_users) > tutor_index + 1:
                    course.instructor.add(tutor_users[(tutor_index + 1) % len(tutor_users)])
                
                created_courses.append(course)
                self.stdout.write(f'  ✓ Created course: {course.name}')
            else:
                created_courses.append(course)
        
        return created_courses

    def create_chapters_and_content(self, courses):
        """Create chapters and content for courses"""
        self.stdout.write('Creating chapters and content...')
        
        from commons.utils.enums import CONTENT_TYPE
        
        for course in courses:
            for chapter_num in range(1, 4):  # 3 chapters per course
                chapter, created = Chapter.objects.get_or_create(
                    course=course,
                    chapter_name=f'Chapter {chapter_num}',
                    defaults={
                        'chapter_title': f'Chapter {chapter_num}: Introduction',
                        'chapter_number': chapter_num,
                    }
                )
                
                if created:
                    # Create some content for each chapter
                    for content_num in range(1, 3):  # 2 content items per chapter
                        Content.objects.get_or_create(
                            chapter=chapter,
                            content_number=content_num,
                            defaults={
                                'title': f'Content {content_num}',
                                'description': f'Content {content_num} for {chapter.chapter_name}',
                                'content_type': CONTENT_TYPE.VIDEO,
                                'url': 'https://example.com/video.mp4',
                            }
                        )
        
        self.stdout.write(f'  ✓ Created chapters and content for {len(courses)} courses')

    def create_enrollments(self, courses, student_users):
        """Create course enrollments"""
        self.stdout.write('Creating enrollments...')
        
        enrollment_count = 0
        for course in courses[:3]:  # Enroll students in first 3 courses
            for student in student_users[:4]:  # Enroll first 4 students
                enrollment, created = Enrollement.objects.get_or_create(
                    user=student,
                    course=course,
                )
                if created:
                    enrollment_count += 1
        
        self.stdout.write(f'  ✓ Created {enrollment_count} enrollments')

    def create_reviews(self, courses, student_users):
        """Create course reviews"""
        self.stdout.write('Creating reviews...')
        
        review_count = 0
        for course in courses[:3]:
            for student in student_users[:3]:
                review, created = Reviewer.objects.get_or_create(
                    reviewer=student,
                    target=course.id,
                    defaults={
                        'comment': f'Great course! Very helpful and well-structured.',
                        'rating': random.choice([RATING_VALUES.EXCELENT, RATING_VALUES.VERY_GOOD, RATING_VALUES.GOOD]),
                    }
                )
                if created:
                    review_count += 1
        
        self.stdout.write(f'  ✓ Created {review_count} reviews')

    def create_educational_backgrounds(self, users, education_levels):
        """Create educational backgrounds for users"""
        self.stdout.write('Creating educational backgrounds...')
        
        bg_count = 0
        for user in users[:5]:  # Create for first 5 users
            if education_levels:
                level = random.choice(education_levels)
                bg, created = EducationalBackground.objects.get_or_create(
                    user=user,
                    level_of_education=level,
                    defaults={
                        'school_of_education': f'Sample University',
                        'field_of_study': 'General Studies',
                        'start_date': date(2020, 1, 1),
                        'year_of_graduation': date(2024, 6, 1),
                        'currently_learning': False,
                    }
                )
                if created:
                    bg_count += 1
        
        self.stdout.write(f'  ✓ Created {bg_count} educational backgrounds')

