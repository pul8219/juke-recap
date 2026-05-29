# Juke-recap 📀

사진과 음악으로 추억을 기록하는 웹 앱.
사진 슬라이드쇼에 YouTube 배경음악을 입혀서, 그날의 분위기를 그대로 되살려줍니다.

## 주요 기능

- **잠금 화면** — 6자리 PIN 인증 (30분간 세션 유지)
- **추억 만들기** — 제목, 날짜, 설명, 사진(드래그 앤 드롭), YouTube 배경음악 설정
- **대표 썸네일 지정** — 여러 사진 중 하나를 클릭해서 대표 이미지 선택
- **추억 조회** — 전체화면 사진 슬라이드쇼 + YouTube 배경음악 자동 재생
- **음악 제목 표시** — 상단에 곡 제목이 표시되며, 클릭하면 YouTube로 이동
- **모바일 대응** — 음소거 자동 재생 후 탭하여 소리 켜기
- **정렬** — 최신순 / 오래된순 전환

## 기술 스택

### 전체 구조

```
브라우저 → Nginx(80) → Frontend(3000) : 화면
                     → Backend(8000)  : API (/api/*)
                                       → PostgreSQL : 데이터 저장
                                       → S3/MinIO   : 사진 저장
```

모든 서비스는 **Docker Compose**로 한 번에 띄울 수 있습니다.
Nginx가 앞에서 요청을 받아 프론트엔드/백엔드로 나눠줍니다.

### Frontend — React + Vite

| 이름 | 역할 |
|------|------|
| **React 18** | UI 라이브러리. 화면을 "컴포넌트"라는 작은 조각으로 나눠서 만듦 |
| **Vite** | 개발 서버 & 빌드 도구. 코드를 수정하면 브라우저에 즉시 반영(HMR) |
| **YouTube IFrame API** | YouTube 영상을 제어(재생/음소거/볼륨)하기 위한 공식 API |

**컴포넌트 구조:**

```
App.jsx                   ← 최상위. 인증/라우팅/상태 관리
├── LockScreen.jsx        ← PIN 입력 잠금 화면
├── MemoryGrid.jsx        ← 추억 카드 목록 (그리드 레이아웃)
│   └── MemoryCard.jsx    ← 개별 추억 카드 (썸네일 + 제목 + 날짜)
├── MemoryViewer.jsx      ← 추억 상세 보기 (전체화면)
│   ├── SlideShow.jsx     ← 사진 슬라이드쇼 (5초 자동 전환, 좌우 화살표, 썸네일 바)
│   └── YoutubePlayer.jsx ← YouTube 배경음악 플레이어 (음소거/해제 버튼)
└── AddMemoryModal.jsx    ← 새 추억 만들기 모달 (사진 업로드, YouTube URL 입력)
```

> **React 핵심 개념 간단 정리:**
> - **컴포넌트** = 화면의 한 조각을 담당하는 함수. `function LockScreen() { return <div>...</div> }` 형태
> - **props** = 부모가 자식에게 전달하는 데이터. `<MemoryCard memory={data} />` → `memory`가 props
> - **state** (`useState`) = 컴포넌트 안에서 변하는 값. 값이 바뀌면 화면이 자동으로 다시 그려짐
> - **effect** (`useEffect`) = 컴포넌트가 화면에 나타나거나 특정 값이 바뀔 때 실행되는 코드
> - **JSX** = HTML처럼 생긴 JavaScript 문법. `<div style={{color: 'red'}}>` 같은 형태

### Backend — Django REST Framework

| 이름 | 역할 |
|------|------|
| **Django 4.2** | Python 웹 프레임워크. 모델(DB 구조) 정의, URL 라우팅, ORM 제공 |
| **Django REST Framework** | Django 위에서 REST API를 쉽게 만들어주는 도구 |
| **boto3** | AWS S3 (또는 MinIO) 에 파일을 업로드/삭제하기 위한 Python SDK |
| **Gunicorn** | 프로덕션용 WSGI 서버. Django 앱을 안정적으로 서빙 |
| **psycopg** | PostgreSQL 연결 드라이버 |

**API 엔드포인트:**

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/verify-pin/` | PIN 인증 |
| GET | `/api/memories/` | 전체 추억 목록 |
| POST | `/api/memories/` | 새 추억 생성 (사진 포함) |
| GET | `/api/memories/:id/` | 추억 상세 조회 |
| DELETE | `/api/memories/:id/` | 추억 삭제 (S3 사진도 함께 삭제) |
| POST | `/api/memories/:id/photos/` | 기존 추억에 사진 추가 |
| DELETE | `/api/photos/:id/` | 개별 사진 삭제 |

**데이터 모델:**

```
Memory (추억)
├── id          : UUID (자동 생성)
├── title       : 제목
├── description : 설명 (선택)
├── youtube_url : YouTube 링크 (선택)
├── thumbnail   : 대표 이미지 URL
├── memory_date : 추억 날짜
└── created_at  : 생성 시각

MemoryPhoto (사진)
├── id        : UUID (자동 생성)
├── memory    : Memory FK (어떤 추억에 속하는지)
├── image_url : S3 이미지 URL
├── order     : 순서
└── uploaded_at: 업로드 시각
```

### 인프라

| 이름 | 역할 |
|------|------|
| **Docker Compose** | 모든 서비스(DB, 스토리지, 백엔드, 프론트엔드, Nginx)를 한 명령으로 실행 |
| **Nginx** | 리버스 프록시. 브라우저 요청을 프론트엔드/백엔드로 분기 |
| **PostgreSQL 15** | 관계형 데이터베이스. 추억과 사진 메타데이터 저장 |
| **MinIO** (로컬) | S3 호환 오브젝트 스토리지. 로컬 개발 시 사진 저장용 |
| **AWS S3** (프로덕션) | 프로덕션 환경에서의 사진 저장소 |

## 로컬 개발 환경 실행

### 사전 준비

- Docker & Docker Compose

### 실행

```bash
# 1. 환경 변수 파일 생성
cp .env.example .env.local
# .env.local 파일을 열어 값을 채워넣으세요

# 2. 전체 서비스 실행
docker compose --env-file .env.local up --build

# 3. 브라우저에서 접속
# http://localhost
```

### 환경 변수 (.env.local)

| 변수 | 설명 |
|------|------|
| `DJANGO_SECRET_KEY` | Django 암호화 키 (아무 문자열) |
| `DJANGO_DEBUG` | 디버그 모드 (`True`/`False`) |
| `ALLOWED_HOSTS` | 허용할 호스트명 (쉼표 구분) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | PostgreSQL 접속 정보 |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | S3/MinIO 인증 정보 |
| `AWS_STORAGE_BUCKET_NAME` | 사진 저장 버킷 이름 |
| `AWS_S3_ENDPOINT_URL` | MinIO 주소 (로컬: `http://minio:9000`, 프로덕션: 비워둠) |
| `AWS_S3_CUSTOM_DOMAIN` | 이미지 URL 생성 시 사용할 도메인 |
| `APP_PASSCODE` | 잠금 화면 PIN 번호 |
| `CORS_ALLOWED_ORIGINS` | CORS 허용 출처 |

## 프로젝트 구조

```
memory-app/
├── docker-compose.yml     # 로컬 개발용 Docker Compose
├── .env.example           # 환경 변수 템플릿
├── .env.local             # 로컬 환경 변수 (git 제외)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx       # 엔트리포인트
│       ├── App.jsx        # 루트 컴포넌트
│       ├── index.css      # 전역 스타일
│       ├── api/
│       │   └── memoryApi.js   # 백엔드 API 호출 함수
│       └── components/
│           ├── LockScreen.jsx
│           ├── MemoryGrid.jsx
│           ├── MemoryCard.jsx
│           ├── MemoryViewer.jsx
│           ├── SlideShow.jsx
│           ├── YoutubePlayer.jsx
│           └── AddMemoryModal.jsx
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── config/            # Django 설정
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── memories/          # 메인 앱
│       ├── models.py      # Memory, MemoryPhoto 모델
│       ├── views.py       # API 로직
│       ├── serializers.py # JSON 직렬화
│       └── urls.py        # URL 라우팅
└── nginx/
    └── nginx.conf         # Nginx 설정
```
