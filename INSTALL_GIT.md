# Установка Git для Windows

## 🔧 Установка Git

### Вариант 1: Через официальный установщик (рекомендуется)

1. Скачайте Git для Windows:
   - Перейдите на https://git-scm.com/download/win
   - Скачайте установщик (автоматически определит 64-bit или 32-bit)

2. Запустите установщик:
   - Нажимайте "Next" на всех шагах
   - Оставьте настройки по умолчанию
   - На шаге "Choosing the default editor" можно выбрать "Visual Studio Code" если установлен
   - На шаге "Adjusting your PATH environment" выберите "Git from the command line and also from 3rd-party software"
   - Нажмите "Install"

3. После установки:
   - Закройте и откройте PowerShell заново
   - Проверьте установку:
   ```powershell
   git --version
   ```

### Вариант 2: Через Chocolatey (если установлен)

```powershell
choco install git
```

### Вариант 3: Через winget (Windows 10/11)

```powershell
winget install --id Git.Git -e --source winget
```

## ✅ После установки

1. Закройте и откройте PowerShell заново
2. Проверьте установку:
   ```powershell
   git --version
   ```
   Должно показать версию Git (например: `git version 2.42.0`)

3. Настройте Git (первый раз):
   ```powershell
   git config --global user.name "Ваше Имя"
   git config --global user.email "your.email@example.com"
   ```

## 🚀 После установки Git

Теперь можно выполнить команды из `README_TELEGRAM_SETUP.md`:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/loya.git
git push -u origin main
```

## 📝 Альтернатива: Загрузка через GitHub Desktop

Если не хотите использовать командную строку:

1. Скачайте GitHub Desktop: https://desktop.github.com/
2. Установите и войдите в аккаунт GitHub
3. Создайте репозиторий на GitHub.com
4. В GitHub Desktop: File → Add Local Repository
5. Выберите папку проекта
6. Нажмите "Publish repository"


