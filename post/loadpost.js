const addPost = () => {
  const mainElement = document.querySelector('#main')
  const pathSlug = document.location.pathname.split('/')[2]
  const post = posts.find(x => x.slug === pathSlug)

  const contentElement = document.createElement('div')
  const titleElement = document.createElement('h1')
  titleElement.innerHTML = `<a href="https://jakejk.io/">${blogTitle}</a>`

  const { title, content, date } = post
  contentElement.innerHTML = `
  <h1>${title}</h1>
  <h3>${date}</h3>
  ${content}
  `
  mainElement.append(titleElement)
  mainElement.append(contentElement)
}

addPost()
