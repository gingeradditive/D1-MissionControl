#!/bin/bash

sleep 1  # attende che il backend si chiuda

sudo systemctl restart dryer-frontend.service
sudo systemctl restart getty@tty1.service
sudo systemctl restart dryer-backend.service
