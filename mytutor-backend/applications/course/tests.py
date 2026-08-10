from django.test import TestCase
from .models import Course
from commons.utils.enums import COURSE_LEVEL, COURSE_TYPE

class CourseTests(TestCase):
  @classmethod
  def setUpTestData(cls):
    cls.course = Course.objects.create(
      name="Java Programming",
      course_image="https://example.com/java-programming.jpg",
      course_type=COURSE_TYPE.FREE,
      course_level=COURSE_LEVEL.BEGINNER,
      description="A practical introduction to Java.",
    )

  def test_post_model(self):
    self.assertEqual(self.course.name, "Java Programming")
    self.assertEqual(self.course.description, "A practical introduction to Java.")
    self.assertEqual(str(self.course), "Java Programming")
