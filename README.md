# Planet-Pulse-BE

Selamat datang di repositori Planet Pulse Backend!

## About

PlanetPulse Academy merupakan platform edukasi yang didesain khusus untuk anak-anak berusia 6-17 tahun, mengusung antarmuka yang mengingatkan pada platform pembelajaran online populer, namun disesuaikan sepenuhnya untuk pendidikan lingkungan. 
Aplikasi ini bertujuan menyajikan pengalaman belajar yang menarik dan interaktif melalui konten edukatif dan kuis yang dirancang untuk memacu minat dan partisipasi aktif anak-anak. 
Pengguna dapat dengan aman masuk ke akun mereka, membuat proses pendaftaran menjadi lebih lancar, serta mengakses detail profil untuk melacak perjalanan belajar mereka. Fleksibilitas untuk mengedit profil memberikan pengguna kebebasan untuk menyesuaikan preferensi mereka. 

Platform ini mengorganisir kontennya ke dalam unit-unit dengan topik-topik khusus, memberikan pengguna kemudahan dalam melihat progres mereka per unit dan memilih pelajaran yang menarik. 
Setiap pelajaran disajikan dengan detail mendalam tentang topik lingkungan, diikuti oleh kuis interaktif yang dirancang untuk memperkuat pemahaman. 
Dengan menekankan interaktivitas, pemantauan progres, struktur konten yang terorganisir, dan desain ramah pengguna, PlanetPulse Academy tidak hanya bertujuan untuk memberikan pengetahuan tentang konservasi lingkungan, tetapi juga untuk menanamkan rasa tanggung jawab dan cinta terhadap planet melalui perjalanan belajar yang inovatif dan interaktif.

## Team
Ufo Vanguard Team (HF24-47)

- Anaf Naufalian (Hacker): [Twitter](https://twitter.com/anafthdev_)
- Azra Hudaya (Hustler): [Instagram](https://www.instagram.com/azrahudaya/)
- Muhamad Danendra Prawiraamijoyo (Hacker): [Instagram](https://www.instagram.com/rofl1st/)
- Muhammad Rafi Danendra Putra (Hipster): [Instagram](https://www.instagram.com/rafi_danen/)

## Other
- [Planet Pulse Android App](https://github.com/Planet-Pulse-Academy/PlanetPulse-Academy)
- [Planet Pulse Backend](https://github.com/ROFL1ST/PlanetPulse-be)

# Usage

1. Clone this repository

```markdown
https://github.com/ROFL1ST/PlanetPulse-be.git
```
2. run "npm install"
3. Create .env file, then copy this code below

```dotenv
DB_HOST = [mongodb_host]  <--- insert your mongodb
JWT_ACCESS_TOKEN = [jwt_token]
JWT_INVITATION_TOKEN = [jwt_invitation_token]

DB_DATABASE = todo

PORT = 8000
MAIL_CLIENT_URL = http://localhost:9000/api
MAIL_CLIENT_DEPLOY = [url]
CLOUD_NAME = [cloud_name]
API_KEY_CLOUD = [cloud_key]
API_SECRET_CLOUD = [secret_cloud]

MAIL_HOST = [host_mail]
MAIL_PORT = [port]
MAIL_USERNAME = [mail_username]
MAIL_PASSWORD = [mail_password]
MAIL_CLIENT_URL = [url]
EMAIL_MAIL= [your_email]
EMAIL_PASSWORD = [your_password]
```
4. run "npm start"

**LOCAL URL** = http://localhost:9000/api/

**ONLINE URL** = https://us-central1-planetpulse-b2400.cloudfunctions.net/api


## User

#### Login

```markdown
/user/login
```
**Method : POST**
Headers

|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body

|   Name   |  Status  |         |
| :------: | :------: | :-----: |
| email    | Required | String  |
| username | Required | String  |
| password | Required | String  |

#### Register
```markdown
/user/register
```
**Method : POST**
Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Optional | String |

Body
|    Name     |  Status  |          |
| :-------: | :------: | :------: |
| email  | Required | String  |
| username  | Required | String  |
| password     | Required | String   |
| name       | Required | String   |

#### update profile
```markdown
/user/[id]
```
**Method : PUT**
Headers

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body
|    Name     |  Status  |          |
| :-------: | :------: | :------: |
| username  | Optional | String  |
| name     | Optional | String   |
| photo_profile | Optional | File   |

#### Search user

```markdown
/user/search
```
**Method : GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Params
|    Name     |  Status  | 
| :-------: | :------: |
| username  | Optional |
| name     | Optional |


#### Detail User
```markdown
/user/[id]
```
**Method : GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

### Profile

```markdown
/user/
```

**Method: GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |


## Lesson

### Lesson
```markdown
/lesson
```

**Method: GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |


### category
```
/lesson/category
```

**Method: GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |


### post category (Admin only)
```
/lesson/category/post
```

**Method: POST**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body
|    Name     |  Status  |          |
| :-------: | :------: | :------: |
| name     | Required | String   |
| description | Required | String   |

### update category (Admin only)
```
/lesson/category/[id]
```

**Method: PUT**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body
|    Name     |  Status  |          |
| :-------: | :------: | :------: |
| name     | Required | String   |
| description | Required | String   |

### stages
```
/lesson/stages/[id_lesson]
```

**Method: GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

### book content stage
```
/lesson/stages/content/[id]
```

**Methods: GET**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

### post stage (Admin only)
```
/lesson/stages/post
```

**Method: POST**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body
|    Name    |  Status  |          |
| :-------:  | :------: | :------: |
| name       | Required | String   |
| id_lesson  | Required | String   |
| difficulty | Required | Integer  |


### post book content stage (Admin only)
```
/lesson/stages/content/[id]
```

**Method: POST**

Headers
|     Name      |  Status  |        |
| :-----------: | :------: | :----: |
| Authorization | Required | String |

Body
|    Name    |  Status  |          |
| :-------:  | :------: | :------: |
| content    | Required | String   |

