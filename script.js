class TabLinks {
  constructor(links, tabs) {
    this.links = links
    this.tabs = tabs
    this.links.forEach((link) => {
      link.addEventListener("click", () => {
        this.openCurrentTab(link)
      })
    })
  }
  openCurrentTab(link) {
    this.tabs.forEach((tab) => {
      if (tab.dataset.value === link.dataset.value) {
        const activeTab = document.querySelector(".tab.active")
        const activeLink = document.querySelector(".header__tab-link.active")

        activeTab.classList.remove("active")
        activeLink.classList.remove("active")

        switch (parseInt(tab.dataset.value)) {
          case 1:
            const users = new Users()
            users.fetchUsers()
            break
          case 2:
            const favourite = new Favourites()
            favourite.outputFavourites()
            break
        }

        link.classList.add("active")
        tab.classList.add("active")
      }
    })
  }
}
class Users {
  async fetchUsers() {
    try {
      const response = await fetch("https://json.medrating.org/users/")
      const data = await response.json()

      this.users = data
      this.outputUsers()
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }
  outputUsers() {
    const tree = document.querySelector("#tab-list")

    tree.innerHTML = ``
    this.users.map((user) => {
      if (user.name) {
        tree.insertAdjacentHTML(
          "afterbegin",
          `
            <li class="tabs__user">
            <span class="user__span" data-id="${user.id}">${user.name}</span>
            </li>
          `
        )
        const span = tree.querySelector("span")
        this.setUserListener(span, user)
      }
    })
  }
  setUserListener(span, user) {
    span.addEventListener("click", () => {
      const album = new Albums()
      album.fetchAlbums(span, user)
    })
  }
}
class Albums {
  async fetchAlbums(span, user) {
    try {
      const response = await fetch(
        `https://json.medrating.org/albums?userId=${user.id}`
      )
      const data = await response.json()

      this.outputAlbums(span.parentNode, data)
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }
  outputAlbums(list, data) {
    if (list.querySelector("ul")) {
      list.classList.remove("active")
      list.querySelector("ul").remove()
    } else {
      const albumUl = document.createElement("ul")

      albumUl.classList.add("tabs__album-list")
      data.map((album) => {
        list.classList.add("active")
        albumUl.insertAdjacentHTML(
          "afterbegin",
          `
            <li class="tabs__album">
                <span class="album__span">${album.title}</span>
            </li>
          `
        )
        const span = albumUl.querySelector("span")

        this.setAlbumListener(span, album)
      })
      list.appendChild(albumUl)
    }
  }
  setAlbumListener(span, album) {
    span.addEventListener("click", () => {
      const photos = new Photos()
      photos.fetchPhotos(span, album)
    })
  }
}
class Photos {
  async fetchPhotos(span, album) {
    try {
      const response = await fetch(
        `https://json.medrating.org/photos?albumId=${album.id}`
      )
      const data = await response.json()
      this.outputPhotos(span.parentNode, data)
    } catch (e) {
      console.log(`Error: ${e}`)
    }
  }
  outputPhotos(list, data) {
    if (list.querySelector("ul")) {
      list.classList.remove("active")
      list.querySelector("ul").remove()
    } else {
      const photosUl = document.createElement("ul")

      photosUl.classList.add("tabs__photos-list")
      data.map((album) => {
        list.classList.add("active")
        photosUl.insertAdjacentHTML(
          "afterbegin",
          `
            <li class="tabs__photos">
              <span class="photo__star"></span>
              <img class="album__img" src="${album.thumbnailUrl}" title="${album.title}">
            </li>
          `
        )
        const star = photosUl.querySelector("span")
        const photo = photosUl.querySelector("img")

        if (localStorage.getItem(album.id)) {
          star.classList.add("favourite")
        }
        const favourites = new Favourites()
        favourites.setStarListener(star, album)
        this.setPhotoListener(photo, album.url)
      })
      list.appendChild(photosUl)
    }
  }
  setPhotoListener(photo, url) {
    photo.addEventListener("click", () => {
      const modal = new Modal()
      modal.createModal(url)
    })
  }
}
class Favourites {
  outputFavourites() {
    const favourite = document.querySelector("#favourite-list")

    favourite.innerHTML = ``
    let keys = Object.keys(localStorage)
    for (let key of keys) {
      const album = JSON.parse(localStorage.getItem(key))
      favourite.insertAdjacentHTML(
        "afterbegin",
        `
          <li class="favourite__photos">
            <span class="photo__star"></span>
            <img class="album__img" src="${album.thumbnailUrl}" title="${album.title}">
          </li>
        `
      )
      const star = favourite.querySelector("span")
      const photo = favourite.querySelector("img")

      if (localStorage.getItem(album.id)) {
        star.classList.add("favourite")
      }
      localStorage.setItem(album.id, JSON.stringify(album))
      this.setStarListener(star, album)

      const photos = new Photos()
      photos.setPhotoListener(photo, album.url)
    }
  }
  setStarListener(star, album) {
    star.addEventListener("click", () => {
      if (localStorage.getItem(album.id)) {
        star.classList.remove("favourite")
        localStorage.removeItem(album.id)
        this.outputFavourites()
      } else {
        star.classList.add("favourite")
        localStorage.setItem(album.id, JSON.stringify(album))
      }
    })
  }
}
class Modal {
  constructor() {
    this.modal = ""
  }
  createModal(url) {
    const modal = document.createElement("div")

    modal.classList.add("modal")
    modal.insertAdjacentHTML(
      "afterbegin",
      `
        <img class="modal__img" src="${url}" alt="">
        <div class="modal__bg"></div>
      `
    )
    document.body.appendChild(modal)
    this.modal = modal
    this.setModalListener()
  }
  setModalListener() {
    const overlay = document.querySelector(".modal__bg")

    overlay.addEventListener("click", () => {
      this.modal.parentNode.removeChild(this.modal)
    })
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".header__tab-link")
  const tabs = document.querySelectorAll(".tab")

  const tabList = new TabLinks(links, tabs)

  const users = new Users()
  users.fetchUsers()
})
