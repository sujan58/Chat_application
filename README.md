# Deep Chat - Real-time Chat Application

A modern, full-stack real-time chat application built with **Java Spring Boot**, **WebSocket**, and **PostgreSQL**. Featuring a sleek Discord-inspired dark theme, multi-channel support, and secure authentication.

## 🚀 Features

*   **Real-time Messaging**: Instant message delivery powered by WebSocket and STOMP protocol.
*   **Multi-Channel Support**: Seamlessly switch between distinct channels (`#general`, `#off-topic`, `#help`) with isolated chat histories.
*   **Live User Tracking**: See who is currently online in the sidebar.
*   **Secure Authentication**: User registration and login protected by **JWT (JSON Web Tokens)**.
*   **Persistent History**: All messages are stored securely in a PostgreSQL database.
*   **Modern UI/UX**: Responsive, dark-themed interface with custom message bubbles and avatars.
*   **Message Types**: Handles chat messages, user join/leave events, and system notifications intelligently.

## 🛠️ Tech Stack

### Backend
*   **Java 17+**
*   **Spring Boot 3.x** (Web, Security, Data JPA, WebSocket)
*   **Spring Security 6.x** (Stateless JWT Authentication)
*   **PostgreSQL** (Database)
*   **Lombok** (Boilerplate reduction)

### Frontend
*   **HTML5 & CSS3** (Custom Flexbox layouts, Variables)
*   **JavaScript (ES6+)**
*   **SockJS & Stomp.js** (WebSocket client)

## ⚙️ Prerequisites

*   **Java 17** or higher
*   **Maven** 3.6+
*   **PostgreSQL** 14+

## 📥 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/sujan58/Chat_application.git
    cd Chat_application
    ```

2.  **Database Configuration**
    Ensure PostgreSQL is running and create a database named `chatapp_db`.
    *   Default credentials are set to `postgres` / `password`.
    *   Update `src/main/resources/application.properties` if your credentials differ:
        ```properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/chatapp_db
        spring.datasource.username=your_username
        spring.datasource.password=your_password
        ```

3.  **Build the Project**
    ```bash
    mvn clean install
    ```

4.  **Run the Application**
    ```bash
    mvn spring-boot:run
    ```
    The application will start on `http://localhost:8080`.

## 🖥️ Usage

1.  Open your browser and navigate to `http://localhost:8080`.
2.  **Register** a new account.
3.  **Login** with your credentials.
4.  Start chatting in the `#general` channel or switch to others!
5.  Open a second browser window (incognito) to simulate multiple users and see real-time updates.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
