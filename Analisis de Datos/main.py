# Import libraries

import math
import numpy as np
import pymongo
import re
import urllib.request as urllib2
import datetime

from time import sleep
from bs4 import BeautifulSoup

# Global variables
user_base_url = "https://www.anime-planet.com/users/all?name="
user_page_url = "https://www.anime-planet.com/users/all?name=&page={}"
user_url_tmp = "https://www.anime-planet.com/users/{}"
user_anime_url_tmp = "https://www.anime-planet.com/users/{}/anime/watched"
baseurl = "https://www.anime-planet.com"

count = 1
animeTagsCnt = 1
animeId = 1

# Definir colleciones y otros memes
#uri = 'mongodb://anal:anal18@18.220.137.254/anal'
uri = 'mongodb://anal:anal18@localhost/anal'
client = pymongo.MongoClient(uri)
db = client['anal']
usersdb = db['users']
animesdb = db['animes']
tagsdb = db['tags']

# --------------------------
# Funciones
# --------------------------

# Funcion para obtener BeautifulSoupObjects
def getSoupObj(url):
    sleep(1.5)
    try:
        r = urllib2.urlopen(url)
    except UnicodeEncodeError as e:
        return None
    html = r.read()
    htmltext= html.decode('utf-8')
    return BeautifulSoup(htmltext,'lxml')


# ------
# Obtener los animes vistos por un usuario
# ------
def getAnimes(user):

    global animeTagsCnt 
    global animeId 

    # Paginas del usuario (profile y animes vistos)
    user_url = user_url_tmp.format(user['_id'])
    user_anime_url = user_anime_url_tmp.format(user['_id'])

    # Obtenemos la informacion del usuario
    req = urllib2.Request(user_url,headers=hdr)
    userObj=getSoupObj(req)

    # Si no se encuentra, pasa al siguiente usuario
    if userObj == -1:
        return

    # Se obtiene informacion del usuario    
    user_data = userObj.find('ul', {'class': 'userStats'}).findAll('li')
    try:
        user_city = user_data[0].text
        user_genAge= user_data[2].text.strip().split('/')        
    except:
        user_city = ""
        user_genAge=user_data[1].text.strip().split('/')


    # Edad y Sexo
    user['age'] = user_genAge[0].strip()
    user['gender'] = user_genAge[1].strip()

    # Iniciamos la lista de animes
    user['animes'] = []

    # En cada pagina hay 30 animes, asi que son 30 paginas
    pages = int(np.ceil(user['animesSeen'] / 30))
    
    # Iniciamos contador de paginas
    countPages = 1

    # Hacemos una copia de /users/{}/anime/watched 
    user_anime_url_temp = user_anime_url
    

    while countPages <= pages:

        # Obtenemos las paginas de los usuarios
        req = urllib2.Request(user_anime_url,headers=hdr)
        animeListObj = getSoupObj(req)

        # Los animes de los usuarios
        usersAnimesObj = animeListObj.find('ul', {'class':'cardDeck'}).findAll('li')
        
        # Por cada anime...
        for userAnime in usersAnimesObj:
            # Obtener el titulo, el puntaje que el usuario le da
            #id=title, score, scoreCount, genres, scoredBy 

            # Inicializar el objeto anime
            anime = {}

            # Crear un objeto de cada objeto de anime
            scrObject =  BeautifulSoup(userAnime.a['title'], 'html.parser')

            # Obtener el titulo del anime
            title = scrObject.find('h5').text
            anime['title'] = title

            # Si no existe el anime, se crea
            if animesdb.find({ "title": title }).count() == 0:

                # Primero, almacenamos los tags
                try:
                    tagsHTML = scrObject.findAll('ul')[1].findAll('li')

                    # Obtener los tags
                    tags = list(map(lambda x: x.text, tagsHTML))
                    for tag in tags:
                        
                        # Si el tag no existe, se crea
                        # Si no, se actualiza
                        if tagsdb.find({ "title": tag }).count() == 0:

                            animeTag = {}
                            animeTag['_id'] = animeTagsCnt
                            animeTag['title'] = tag
                            animeTag['count'] = 1
                            animeTagsCnt = animeTagsCnt + 1
                            tagsdb.insert_one(animeTag)

                        else:
                            tagMeme = list(tagsdb.find({ "title": tag }).limit(1))[0]
                            count = tagMeme['count']+1
                            tagsdb.update_one({'title': tag}, {'$set': {'count': count }})
                except: 
                    tagsHTML = ""
                    tags = []
               
                # Luego, el rating
                try:
                    ratings = scrObject.findAll('div', {'class': 'ttRating'})
                    rating = float(ratings[0].text)
                    if len(ratings) == 2:
                        ratingUser = float(ratings[1].text)
                    else:
                        ratingUser = 0   
                except:
                    rating = 0
                    ratingUser = 0

                # Finalmente, el anime
                anime['_id'] = animeId
                anime['title'] = title
                anime['rating'] = rating
                anime['tags'] = tags

                # Se "linkea" el anime actual al usuario
                animeWatched = {}
                animeWatched['animeId'] = animeId
                animeWatched['ratingUser'] = ratingUser
                user['animes'].append(animeWatched)

                # Se incrementa el ID del anime
                animeId = animeId + 1

                # Se inserta a la BD
                animesdb.insert_one(anime)
            else:
                # Necesitamos este meme para obtener el ID del anime
                anix = animesdb.find({ "title": title })
                aaa = list(anix)[0] 
            
                # El rating
                try:
                    ratings = scrObject.findAll('div', {'class': 'ttRating'})
                    if (len(ratings) == 2):
                        rating = float(ratings[1].text)
                    else:
                        rating = 0
                except:
                    rating = 0
                animeWatched = {}
                animeWatched['animeId'] = aaa['_id']
                animeWatched['ratingUser'] = rating
                user['animes'].append(animeWatched)

        countPages = countPages +1
        user_anime_url = user_anime_url_temp + "?sort=title&page={}"
        user_anime_url = user_anime_url.format(countPages)

    # Insertamos el usuario
    usersdb.insert_one(user)


# ====================
#  Proceso principal!

TIHS=10000
while count < TIHS:
    hdr = {'User-Agent': 'Mozilla/5.0'}
    req = urllib2.Request(user_base_url,headers=hdr)
    usersBsObj = getSoupObj(req)

    objs = usersBsObj.findAll('td', {'class': 'tableUserName'})
    objsSeen= usersBsObj.findAll('td',{'class': 'tableUserAnimeWatched'})
    print("Going in page #", count)
    for obj,objS in zip(objs,objsSeen):

        # objA seria el <a> que continie el # de animes vistos por el usuario
        objA= objS.find('a')
        # Si no tiene animes terminados, bais
        if objA is None: continue
        # objA se convierte en el # de animes vistos por el usuario 
        objA = objA.text

        # Trata de convertir a entero, y checkear si es menor de 50.
        # Si no puede convertir, se pasa a Falso
        try:
            hasSeenMinAnimes = int(objA) > 50
        except:
            hasSeenMinAnimes = False

        # Si no ha visto suficientes animes, bais
        if not hasSeenMinAnimes: continue

        # objB seria el nombre del usuario en cuestion
        objB = obj.find('a').text 

        user = {}
        user['_id'] = objB
        user['animesSeen'] = int(objA)

        # Obtener animes del usuario
        getAnimes(user)

    
    # pasa la pagina
    count = count + 1
    # actualiza el link
    user_base_url = user_page_url.format(count)

