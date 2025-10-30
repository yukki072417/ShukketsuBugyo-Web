# 出欠奉行 API 仕様書

## 共通仕様

### HTTP メソッド

- GET: 読取
- POST: 作成
- PATCH: 更新
- DELETE: 削除

### 曜日指定 0-6

- 0: 日
- 1: 月
- 2: 火
- 3: 水
- 4: 木
- 5: 金
- 6: 土

### リクエストヘッダー

```json
"Content-Type": "application/json"
"Authorization": "Bearer <アクセストークン> || x-api-key: <運営専用の API キー>"
```

### レスポンスヘッダー

```json
"Content-Type": "application/json"
"Access-Control-Allow-Origin": "*"
```

### URI

```
https://<NAME>/...
```

#### 備考

- ベース URL は例の通り HTTPS を使用します（ローカルは自己署名証明書）。クライアントは証明書検証を無効化するか、信頼ストアに追加してください。
- 本書の各エンドポイントのリクエスト・レスポンスのペイロード定義は変更していません。

### API エンドポイント共通レスポンスボディ(GET 以外のメソッド。GET のレスポンスボディは随時記載)

成功時

```json
{
  "success": true,
  ...(その他レスポンスボディ)
}
```

失敗時

```json
{
  "result": "ERROR",
  "message": "ERROR_MESSAGE"
}
```

### エラーコード

`400`: リクエストエラー<br>
`401`: 認証エラー<br>
`403`: 権限エラー<br>
`404`: 存在しないリソース<br>
`409`: リソースの競合<br>
`500`: サーバーエラー<br>

## 認証関係 API

### 先生ユーザ認証リクエスト POST /teacher/login

#### リクエストヘッダー

なし

#### リクエストボディ

```json
{
  "tenant_id": "school001",
  "teacher_id": "teacher001",
  "teacher_password": "password"
}
```

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "token": {
    "access_token": "アクセストークン",
    "refresh_token": "リフレッシュトークン"
  }
}
```

---

### 生徒ユーザ認証リクエスト POST /student/login

#### リクエストヘッダー

なし

#### リクエストボディ

```json
{
  "tenant_id": "school001",
  "student_id": "student001",
  "student_password": "password"
}
```

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "token": {
    "access_token": "アクセストークン",
    "refresh_token": "リフレッシュトークン"
  }
}
```

---

### アクセストークン更新リクエスト POST /auth/refresh

#### リクエストヘッダー

なし

#### リクエストボディ

```json
{
  "refresh_token": "リフレッシュトークン"
}
```

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "token": {
    "access_token": "アクセストークン",
    "refresh_token": "リフレッシュトークン"
  }
}
```

---

### ユーザ認証トークン検証リクエスト POST /auth/verify

#### リクエストヘッダー

```json
{
  "Authorization": "Bearer <アクセストークン>"
}
```

#### リクエストボディ

なし

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "user": {
    "user_id": "user001",
    "tenant_id": "school001"
  }
}
```

## テナント関係 API

### テナント関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "x-api-key": "運営専用のAPIキー"
}
```

---

### テナント作成 POST /school/

#### リクエストボディ

```json
{
  "tenant_id": "school001",
  "tenant_name": "大洗女子学園",
  "tenant_name_en": "Oarai Girls' Academy "
}
```

---

### テナントの取得 GET /school/<テナント ID>

**(リクエストレスポンスは共通のため省略)**

### テナントの更新 PATCH /school/<テナント ID>

#### リクエストボディ

```json
{
  "tenant_name": "大洗女子学園",
  "tenant_name_en": "Oarai Girls' Academy "
}
```

---

### テナント削除 DELETE /school/<テナント ID>

**(リクエストレスポンスは共通のため省略)**

## 時間枠関係 API

### 時間枠関係 API 共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 時間枠作成リクエスト POST /period/

#### リクエストボディ

```json
[
  { "period": "0", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" },
  { "period": "1", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" },
  { "period": "2", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" }
]
```

---

### 時間枠取得リクエスト GET /period/

#### レスポンスボディ

```json
[
  { "period": "0", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" },
  { "period": "1", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" },
  { "period": "2", "start_time": "hh:mm:ss", "end_time": "hh:mm:ss" }
]
```

### 時間枠更新リクエスト PATCH /period/<時間目（整数）>

#### リクエストボディ

```json
{
  "period": "0",
  "start_time": "hh:mm:ss",
  "end_time": "hh:mm:ss"
}
```

---

### 時間枠削除リクエスト DELETE /period/<時間目（整数）>

**共通レスポンスボディに基づく**

---

## コース関係 API

### コース関係 API 共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### コース作成 POST /course/

#### リクエストボディ

```json
[
  {
    "course_name": "プログラミングコース",
    "course_name_en": "Programming Course"
  }
]
```

### コース取得 GET /course/

#### レスポンスボディ

```json
[
  {
    "course_id": "<UUID>",
    "course_name": "プログラミングコース",
    "course_name_en": "Programming Course"
  }
]
```

### コース更新 PATCH /course/<コース ID>

#### リクエストボディ

```json
{
  "course_name": "プログラミングコース",
  "course_name_en": "Programming Course"
}
```

### コース削除 DELETE /course/<コース ID>

**(リクエストレスポンスは共通のため省略)**

---

### コース一括取得 GET /course/

#### レスポンスボディ

```json
[
  {
    "course_id": "<UUID>",
    "course_name": "プログラミングコース",
    "course_name_en": "Programming Course"
  }
]
```

## クラス関係 API

### クラス関係 API 共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

### クラス作成 POST /class/

#### リクエストボディ

```json
{
  "grade": "3",
  "class": "1",
  "teacher_id": "<先生ID>"
}
```

#### レスポンスボディ

**共通レスポンスボディに基づく**

---

### クラス一括取得 GET /class/

#### レスポンスボディ

```json
[
  {
    "grade": "3",
    "class": "1",
    "teacher_id": "<先生ID>"
  },
  {
    "grade": "3",
    "class": "2",
    "teacher_id": "<先生ID>"
  }
]
```

### クラス更新 PATCH /class/

#### リクエストボディ

```json
[
  {
    "grade": "3",
    "class": "1",
    "updated_grade": "1",
    "updated_class": "3",
    "teacher_id": "<先生ID>"
  }
]
```

---

### クラス削除 DELETE /class?/grade=<年>&class=<クラス>

### レスポンスボディ

**共通レスポンスボディに基づく**

## 先生関係リクエスト

### 先生関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 先生ユーザ作成 POST /teacher

#### リクエストヘッダ

```json
  "Content-Type": "application/json"
  "Authorization": "Bearer <アクセストークン>" | "x-api-key": "<運営専用のAPIキー>"
```

#### リクエストボディ

```json
[
  {
    "teacher_id": "teacher001",
    "password": "password",
    "manager": true | false
  }
]
```

---

### 先生ユーザの取得 GET /teacher/<先生ユーザ ID>

**(リクエストレスポンスは共通のため省略)**

---

### 先生ユーザ一括取得 GET /teacher/get/all

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": [
    {
      "teacher_id": "teacher001",
      "manager": true | false
    }
  ]
}
```

---

### 自身の先生ユーザの取得 GET /teacher/get/me

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": {
    "tenant_id": "school001",
    "teacher_id": "teacher001",
    "manager": true | false
  }
}
```

---

### 先生ユーザの削除 DELETE /teacher/<先生ユーザ ID>

**(リクエストレスポンスは共通のため省略)**

---

### 先生ユーザの更新 PATCH /teacher/<先生ユーザ ID>

#### リクエストボディ

```json
{
  "teacher_password": "updated_password",
  "manager": true | false
}
```

## 生徒関係リクエスト

### 生徒関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 生徒ユーザ作成 POST /student/

#### リクエストボディ

```json
[
  {
    "student_id": "student001",
    "student_password": "password",
    "grade": "1",
    "class": "1",
    "number": "1"
  }
]
```

---

### 生徒ユーザ取得 GET /student/one/<生徒ユーザ ID>

#### レスポンスボディ

```json
{
  "student_id": "student001",
  "grade": "1",
  "class": "1",
  "number": "1",
  "graduation_year": "2026"
}
```

---

### 教室内生徒ユーザ取得 GET /student/class/<生徒ユーザ ID>?grade=<年>&class=<クラス>

#### レスポンスボディ

```json
{
  "student_id": "student001",
  "grade": "1",
  "class": "1",
  "number": "1",
  "graduation_year": "2026"
}
```

---

### 生徒ユーザ一括取得 GET /student/all?limit=<最大取得件数>&offset=<取得開始位置>

#### レスポンスボディ

```json
{
  "students": [
    {
      "student_id": "student001",
      "grade": "1",
      "class": "1",
      "number": "1"
    }
  ],
  "total": 1000,
  "limit": 100,
  "offset": 0
}
```

---

### 生徒ユーザ削除 DELETE /student/<生徒ユーザ ID>

**(リクエストレスポンスは共通のため省略)**

### 生徒ユーザ更新 PATCH /student/<生徒ユーザ ID>

#### リクエストボディ

```json
{
  "password": "updated_password",
  "grade": "2",
  "class": "2",
  "number": "2",
  "course_id": "course001" | null
}
```

## クラス関係 API

### クラス関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### クラス作成 POST /class

#### リクエストボディ

```json
[
  {
    "teacher_id": "teacher001",
    "grade": "2",
    "class": "2"
  }
]
```

---

### クラス一括取得 GET /class/classes

#### レスポンスボディ

```json
[
  {
    "teacher_id": "teacher001",
    "grade": "2",
    "class": "2"
  }
]
```

---

### クラス削除 DELETE /class/?grade=<年>&class=<クラス>

**(リクエストレスポンスは共通のため省略)**

---

### クラス更新 PATCH /class/?grade=<年>&class=<クラス>

#### リクエストボディ

```json
[
  {
    "teacher_id": "teacher001",
    "grade": "2",
    "class": "2"
  }
]
```

## 授業関係 API

### 授業関係 API 共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 授業作成 POST /lesson

#### リクエストボディ

```json
[
  {
    "lesson_name": "数学A",
    "lesson_name_en": "MathematicsA",
    "teacher_id": "teacher001",
    "grade": "1"
  }
]
```

### レスポンスボディ

**共通レスポンスボディに基づく**

---

### 授業一括取得 GET /lesson/all

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": [
    {
      "lesson_id": "<UUID>",
      "lesson_name": "数学A",
      "lesson_name_en": "MathematicsA",
      "teacher_id": "teacher001",
      "grade": "1"
    }
  ]
}
```

---

### 授業取得 GET /lesson/<授業 ID>

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": {
    "lesson_id": "<UUID>",
    "lesson_name": "数学A",
    "lesson_name_en": "MathematicsA",
    "teacher_id": "teacher001",
    "grade": "1"
  }
}
```

---

### 授業編集 PATCH /lesson?lesson_id=<授業 ID>

#### リクエストボディ

```json
{
  "lesson_name": "数学A",
  "lesson_name_en": "MathematicsA",
  "grade": "1"
}
```

---

### 授業削除 DELETE /lesson?lesson_id=<授業 ID>

**(リクエストレスポンスは共通のため省略)**

## 時間割関係 API

### 時間割関係 API 共通ヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 時間割作成 POST /timetable/

#### リクエストボディ

```json
{
  "grade": "3",
  "class": "1",
  "period": "1",
  "lesson_id": "<授業ID>",
  "day_of_week": 1
}
```

---

### 時間割取得 GET /timetable?grade=<年>&class=<クラス>

### レスポンスボディ

```json
[
  {
    "day_of_week": 1,
    "period": 1,
    "lesson_name": "<授業名>",
    "lesson_name_en": "<Lesson name>"
  },
  {
    "day_of_week": 1,
    "period": 2,
    "lesson_name": "<授業名>",
    "lesson_name_en": "<Lesson name>"
  }
]
```

---

## 授業関係 API

### 授業関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 授業作成 POST /lesson/

#### リクエストボディ

```json
{
  "lesson_name": "日本語表記授業名",
  "lesson_name_en": "English Lesson Name",
  "teacher_id": "teacher001"
}
```

---

### 授業取得 GET /lesson/one/<授業 ID>

#### レスポンスボディ

```json
{
  "lesson_id": "<UUID>",
  "lesson_name": "日本語表記授業名",
  "lesson_name_en": "English Lesson Name",
  "teacher_id": "teacher001"
}
```

---

### 授業一括取得 GET /lesson/all

#### レスポンスボディ

```json
[
  {
    "lesson_id": "<UUID>",
    "lesson_name": "日本語表記授業名",
    "lesson_name_en": "English Lesson Name",
    "teacher_id": "teacher001"
  }
]
```

---

### 授業削除 DELETE /lesson/<授業 ID>

**(リクエストレスポンスは共通のため省略)**

---

### 授業更新 PATCH /lesson/<授業 ID>

#### リクエストボディ

```json
{
  "lesson_name": "日本語表記授業名",
  "lesson_name_en": "English Lesson Name",
  "teacher_id": "teacher001"
}
```

## 履修関係 API

### 履修関係共通リクエストヘッダ

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 履修一括作成 POST /enrollment/

#### リクエストボディ

```json
[
  {
    "lesson_id": "<UUID>",
    "student_id": "student001"
  },
  {
    "lesson_id": "<UUID>",
    "student_id": "student002"
  }
]
```

#### レスポンスボディ

**201 Created**

```json
{
  "result": "SUCCESS"
}
```

---

### 履修リスト取得 GET /enrollment/

クエリパラメータで履修情報をフィルタリングします。パラメータがない場合は、テナント内のすべての履修情報を返します。

- `lesson_id`: 授業IDでフィルタ
- `student_id`: 生徒IDでフィルタ

例: `GET /enrollment?lesson_id=<授業ID>`

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": [
    {
      "enrollment_id": "1ffb9273-a544-46dc-b6f7-d1a40ad05041",
      "student_id": "student001",
      "lesson_id": "2b2ccfe2-49f9-4b16-944a-f77105c243e6",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 履修情報取得 GET /enrollment/<履修ID>

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": {
    "enrollment_id": "1ffb9273-a544-46dc-b6f7-d1a40ad05041",
    "student_id": "student001",
    "lesson_id": "2b2ccfe2-49f9-4b16-944a-f77105c243e6",
    "status": "ACTIVE"
  }
}
```

---

### 履修情報更新 PATCH /enrollment/<履修ID>

#### リクエストボディ

```json
{
  "status": 1
}
```

#### 備考

- status
  - 0: INACTIVE (非アクティブ)
  - 1: ACTIVE (アクティブ)

#### レスポンスボディ

**200 OK**

```json
{
  "result": "SUCCESS"
}
```

---

### 履修削除 DELETE /enrollment/<履修ID>

#### レスポンスボディ

**204 No Content**

## 出席管理関係 API

### 出席管理関係共通リクエストヘッダー

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <アクセストークン>"
}
```

---

### 出席記録作成 POST /attendance/

#### リクエストボディ

```json
{
  "enrollment_id": "<UUID>",
  "student_id": "student001",
  "date": "2025-01-15",
  "period": 1,
  "status": 1,
  "notes": "<備考>"
}
```

#### 備考

リクエストボディの status は以下の出席状況を表す
{
0: "欠席",
1: "出席",
2: "遅刻",
3: "早退",
4: "出席停止",
5: "公欠",
6: "その他",
}

---

### 授業別生徒出席記録取得 GET /attendance/<授業ID>?date=<日付>&period=<時限>

#### レスポンスボディ

```json
[
  {
    "enrollment_id": "<UUID>",
    "student_id": "student001",
    "date": "2025-01-15",
    "period": 1,
    "status": 1,
    "notes": "<備考>"
  }
]
```

---

### 出席記録更新 PATCH /attendance/

#### リクエストボディ

```json
{
  "enrollment_id": "<UUID>",
  "student_id": "student001",
  "date": "2025-01-15",
  "period": 1,
  "status": 1,
  "notes": "<備考>"
}
```

### 出席記録削除 DELETE /attendance/<授業 ID>?date=<日付>&period=<時限>&student_id=<生徒 ID>

---

### 出席情報取得 GET /attendance/id/<授業ID>?statistics=<true|false>

#### クエリパラメータ

- `statistics`: 統計情報を取得するかどうか
  - `true`: 出席統計情報を取得
  - `false`: 出席データ一覧を取得

#### レスポンスボディ（statistics=true）

```json
{
  "lesson_count": 15,
  "student_statistics": [
    {
      "student_id": "student001",
      "attendance_count": 12,
      "total_lessons": 15,
      "attendance_rate": 80.00
    },
    {
      "student_id": "student002",
      "attendance_count": 14,
      "total_lessons": 15,
      "attendance_rate": 93.33
    }
  ],
  "average_attendance_rate": 86.67
}
```

#### レスポンスボディ（statistics=false）

```json
{
  "attendance_data": [
    {
      "DATE": "2025-01-15",
      "PERIOD": 1,
      "STUDENT_ID": "student001",
      "STATUS": 1,
      "NOTES": "備考"
    },
    {
      "DATE": "2025-01-15",
      "PERIOD": 2,
      "STUDENT_ID": "student002",
      "STATUS": 0,
      "NOTES": "体調不良"
    }
  ]
}
```

#### 備考

- `statistics=true`の場合：
  - 授業回数、各生徒の出席統計、平均出席率を返す
  - 出席回数は STATUS ≠ 2（遅刻以外）でカウント
- `statistics=false`の場合：
  - 指定授業の全出席データを日付・時限順で返す

---

### 生徒別授業出席記録取得 POST /attendance/student-lesson

#### クエリパラメータ

- `date_range`: 取得する日付範囲
  - `all`: 全期間のデータを取得
  - `2025-01-15`: 特定の日付のデータを取得
  - `2025-01-01,2025-01-31`: 期間指定でデータを取得

#### リクエストボディ

```json
{
  "student_id": "student001",
  "lesson_id": "<UUID>"
}
```

#### レスポンスボディ

```json
{
  "result": "SUCCESS",
  "data": [
    {
      "date": "2025-01-15",
      "period": 1,
      "status": 1,
      "notes": "備考"
    },
    {
      "date": "2025-01-16",
      "period": 2,
      "status": 0,
      "notes": "体調不良"
    }
  ]
}
```

#### 備考

- 指定された生徒の特定授業における出席記録を取得
- 日付範囲を指定して期間限定での取得が可能
- 結果は日付・時限順でソートされて返される
