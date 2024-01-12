# Planet-Pulse-BE

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




