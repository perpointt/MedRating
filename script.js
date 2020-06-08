class TabList {
  constructor(headersContainer, tabs) {
    this.headersContainer = headersContainer
    this.tabs = tabs

    this.headersContainer.addEventListener("click", (e) => {
      const index = e.target.closest(".headers__tab-item").dataset.value

      this.openTab(index)
    })
  }

  openTab(index) {
    const tabActive = this.tabs.querySelector(".active")
    tabActive.classList.remove("active")

    const newTabActive = this.tabs.querySelector(`.tab-${index}`)
    newTabActive.classList.add("active")
  }
}

class Fetching {
  constructor() {
    this.users = []
    this.modal = ""
  }

  async getUsers() {
    try {
      const response = await fetch("https://json.medrating.org/users/")
      const data = await response.json()
      this.users = data
      this.getAlbums()
      this.outputUsers()
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }

  async getAlbums() {
    for (let index in this.users) {
      try {
        const response = await fetch(
          `https://json.medrating.org/albums?userId=${index}`
        )
        const data = await response.json()
        this.users[index].albums = data
      } catch (e) {
        console.log(`Error: ${e}`)
      }
    }

    this.outputAlbums()
  }

  outputUsers() {
    const tree = document.querySelector("#tree")

    this.users.map((user) => {
      if (user.name) {
        const userEl = document.createElement("li")
        userEl.classList.add("tabs__user")
        userEl.textContent = user.name
        tree.appendChild(userEl)
      }
    })
  }

  outputAlbums() {
    const allUsers = document.querySelectorAll(".tabs__user")

    this.users.map((user, userIndex) => {
      if (user.name) {
        const albumUl = document.createElement("ul")
        albumUl.classList.add("tabs__album-list")

        user.albums.map((album, albumIndex) => {
          const albumLi = document.createElement("li")
          albumLi.classList.add("tabs__album")
          albumLi.textContent = album.title

          albumUl.appendChild(albumLi)

          this.setAlbumListener(albumLi, album, userIndex, albumIndex)
        })

        allUsers[userIndex].appendChild(albumUl)
      }
    })

    this.toggleList()
  }

  setAlbumListener(albumLi, albumObj, userIndex, albumIndex) {
    albumLi.addEventListener("click", () => {
      if (!albumObj.photos) {
        this.getPhotos(albumObj.id, userIndex, albumIndex)
      }
    })
  }

  async getPhotos(id, userIndex, albumIndex) {
    try {
      const response = await fetch(
        `https://json.medrating.org/photos?albumId=${id}`
      )
      const data = await response.json()

      this.users[userIndex].albums[albumIndex].photos = data

      this.outputPhotos(userIndex, albumIndex)
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }

  outputPhotos(userIndex, albumIndex) {
    const allUsers = document.querySelectorAll(".tabs__user")
    const allAlbums = allUsers[userIndex].querySelectorAll(".tabs__album")
    const albumLi = allAlbums[albumIndex]
    const photosUl = document.createElement("ul")
    photosUl.classList.add("tabs__photos-list")

    this.users[userIndex].albums[albumIndex].photos.map((photo) => {
      this.automatizationOutput(photo, photosUl, false)
    })

    albumLi.appendChild(photosUl)
  }

  createModal(src, title, id) {
    const modal = document.createElement("div")
    modal.classList.add("modal")
    modal.classList.add("open")
    modal.insertAdjacentHTML(
      "afterbegin",
      `
      <div class="modal__overlay">
        <div class="modal__window">
          <div class="modal__header">
            <h2 class="modal__title">Картинка ${id}</h2>
            <span class="modal__close" data-close="true">&times;</span>
          </div>
          <div class="modal__body">
            <img src="${src}" title="${title}">
          </div>
        </div>
      </div>
    `
    )
    document.body.appendChild(modal)
    this.modal = modal

    this.modal.addEventListener("click", this.listenerModal)
  }

  listenerModal = (e) => {
    if (
      e.target.dataset.close ||
      e.target.classList.contains("modal__overlay")
    ) {
      this.closeModal()
    }
  }

  closeModal() {
    this.modal.classList.remove("open")
    this.modal.parentNode.removeChild(this.modal)
    this.modal.removeEventListener("click", this.listenerModal)
  }

  outputSavePhotos() {
    const saveList = document.querySelector("#save-list")

    let keys = Object.keys(localStorage)
    for (let key of keys) {
      const itemObj = JSON.parse(localStorage.getItem(key))

      this.automatizationOutput(itemObj, saveList, true)
    }
  }

  automatizationOutput(photoObj, whenNode, isFavorites) {
    const photoLi = document.createElement("li")
    photoLi.classList.add("tabs__photo")

    const photoStar = document.createElement("span")
    photoStar.classList.add("tabs__star")

    const photoImg = document.createElement("img")
    photoImg.classList.add("tabs__image")
    photoImg.src = photoObj.url
    photoImg.title = photoObj.title

    photoLi.appendChild(photoImg)
    photoLi.appendChild(photoStar)
    whenNode.appendChild(photoLi)

    if (localStorage.getItem(photoObj.id)) {
      photoStar.classList.add("tabs__star_clicked")
    }

    this.setStarListener(photoStar, photoObj, isFavorites)
    this.setImageListener(photoImg, photoObj)
  }

  setStarListener(photoStar, photoObj, isFavorites) {
    photoStar.addEventListener("click", (e) => {
      e.preventDefault()

      if (localStorage.getItem(photoObj.id)) {
        localStorage.removeItem(photoObj.id)
        photoStar.classList.remove("tabs__star_clicked")

        if (isFavorites) {
          const parent = e.target.parentNode
          parent.removeChild(e.target)
          parent.parentNode.removeChild(parent)
        }
      } else {
        localStorage.setItem(photoObj.id, JSON.stringify(photoObj))
        photoStar.classList.add("tabs__star_clicked")
      }
    })
  }

  setImageListener(photoImg, photoObj) {
    photoImg.addEventListener("click", () => {
      this.createModal(photoObj.url, photoObj.title, photoObj.id)
    })
  }

  toggleList() {
    const tree = document.querySelector("#tree")

    for (let li of tree.querySelectorAll("li")) {
      const span = document.createElement("span")
      span.classList.add("show")
      li.prepend(span)
      span.append(span.nextSibling)
    }

    tree.addEventListener("click", (e) => {
      e.preventDefault()

      if (e.target.tagName !== "SPAN") {
        return
      }

      const childrenContainer = e.target.parentNode.querySelector("ul")

      if (!childrenContainer) {
        return
      }

      childrenContainer.hidden = !childrenContainer.hidden

      if (childrenContainer.hidden) {
        event.target.classList.add("hide")
        event.target.classList.remove("show")
      } else {
        event.target.classList.add("show")
        event.target.classList.remove("hide")
      }
    })
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const headersContainer = document.querySelector(".headers")
  const tabs = document.querySelector(".tabs")

  const tabList = new TabList(headersContainer, tabs)

  const FetchingObj = new Fetching()
  FetchingObj.getUsers()
  FetchingObj.outputSavePhotos()
})
