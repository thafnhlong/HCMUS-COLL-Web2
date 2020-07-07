const config = require('../config/default.json')

module.exports = async (page,getCountAndSomeFn,getPageAndSomeFn) => {
  const eCountWithData = await getCountAndSomeFn()
  let totalRowData = eCountWithData
  if (eCountWithData.length > 1)
    totalRowData = totalRowData[0]
  let totalRow=totalRowData[0].count
  if (totalRow==0)
    return [[0,false,false],eCountWithData,null]
  
  const maxPage = Math.ceil(+totalRow / config.pagination)
  let curpage=1
  if (page)
    curpage = +page
  if (curpage > maxPage)
    curpage = maxPage
  else if (curpage < 1)
    curpage = 1
    
  const pv = curpage > 1
  const nv = curpage < maxPage 
  const eListWithData = await getPageAndSomeFn((curpage-1)*config.pagination)
  
  return [[curpage,pv,nv],eCountWithData,eListWithData]
}