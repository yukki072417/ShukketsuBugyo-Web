import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 言語jsonファイルのimport
import login_ja from './ja/login.json'
import login_en from './en/login.json'

import sideBar_ja from './ja/sideBar.json'
import sideBar_en from './en/sideBar.json'

import common_en from './en/common.json'
import common_ja from './ja/common.json'

import attendance_en from './en/attendance.json'
import attendance_ja from './ja/attendance.json'

import schoolSettings_en from './en/schoolSettings.json'
import schoolSettings_ja from './ja/schoolSettings.json'

import classSettings_en from './en/classSettings.json'
import classSettings_ja from './ja/classSettings.json'

import courseSettings_en from './en/courseSettings.json'
import courseSettings_ja from './ja/courseSettings.json'

import periodSettings_en from './en/periodSettings.json'
import periodSettings_ja from './ja/periodSettings.json'

import studentSettings_en from './en/studentSettings.json'
import studentSettings_ja from './ja/studentSettings.json'

import teacherSettings_en from './en/teacherSettings.json'
import teacherSettings_ja from './ja/teacherSettings.json'

import lesson_stats_en from './en/lessonStats.json'
import lesson_stats_ja from './ja/lessonStats.json'

import lesson_en from './en/lesson.json'
import lesson_ja from './ja/lesson.json'

import timetable_ja from './ja/timetable.json'
import timetable_en from './en/timetable.json'

const resources = {
  ja: {
    login: login_ja,
    sidebar: sideBar_ja,
    common: common_ja,
    attendance: attendance_ja,
    schoolSettings: schoolSettings_ja,
    classSettings: classSettings_ja,
    courseSettings: courseSettings_ja,
    periodSettings: periodSettings_ja,
    studentSettings: studentSettings_ja,
    teacherSettings: teacherSettings_ja,
    lessonStats: lesson_stats_ja,
    lesson: lesson_ja,
    timetable: timetable_ja
  },
  en: {
    login: login_en,
    sidebar: sideBar_en,
    common: common_en,
    attendance: attendance_en,
    schoolSettings: schoolSettings_en,
    classSettings: classSettings_en,
    courseSettings: courseSettings_en,
    periodSettings: periodSettings_en,
    studentSettings: studentSettings_en,
    teacherSettings: teacherSettings_en,
    lessonStats: lesson_stats_en,
    lesson: lesson_en,
    timetable: timetable_en
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ja',
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false
    }
  });



export default i18n;