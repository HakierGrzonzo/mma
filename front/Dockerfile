FROM node:20-bullseye-slim
RUN apt update && apt install -y wget unzip

WORKDIR /aws
RUN wget https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -O awscliv2.zip
RUN unzip awscliv2.zip
RUN ./aws/install

WORKDIR /app

COPY ./package.json ./package-lock.json .
RUN npm install

COPY . .
ENTRYPOINT ./entrypoint.sh
