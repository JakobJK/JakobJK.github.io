const addPost = () => {
  const contentElement = document.querySelector('#content')
  const pathSlug = document.location.pathname.split('/')[2]
  console.log(pathSlug)
  const post = posts.find(x => x.slug === pathSlug)

  const { title, content, date } = post
  contentElement.innerHTML = `
  <h1>${title}!!!</h1>
  <h3>${date}</h3>
  ${content}
  `
}

addPost()
