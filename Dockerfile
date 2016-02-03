FROM ubuntu
RUN apt-get update && apt-get install nodejs
CMD [ "nodejs", "index.js" ]
