@echo off
echo === Avvio ambiente di sviluppo Dryer Controller ===

REM Attiva ambiente virtuale Python (se esiste)
IF EXIST venv (
    call venv\Scripts\activate
    echo Ambiente virtuale attivato.
)

REM Avvia il backend in una nuova finestra
echo Avvio backend...
start cmd /k "python3 -m uvicorn backend.main:app --reload"

REM Avvia il frontend React con Vite in una nuova finestra
echo Avvio frontend React...
start cmd /k "cd frontend && npm run dev"

echo Tutto avviato. Premi un tasto per uscire da questo script...
pause > nul
