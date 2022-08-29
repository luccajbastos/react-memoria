import { useEffect, useState } from 'react';
import { items } from './data/items';

import { Button } from './components/Button';
import { InfoItem } from './components/InfoItem';
import { GridItem } from './components/GridItem';

import RestartIcon from './svgs/restart.svg';
import { GridItemType } from './types/GridItemType';
import LogoImage from './assets/devmemory_logo.png';
import * as C from './App.styles';
import { formatTimeElapsed } from './helpers/formatTimeElapsed';
import { tmpdir } from 'os';



const App = () => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [shownCount, setShownCount] = useState<number>(0);
  const [gridItems, setGridItems] = useState<GridItemType[]>([]);
  
  useEffect(() => resetAndCreateGrid(), [])

  useEffect(() => {
      const timer = setInterval(() => {
        if(playing) setTimeElapsed(timeElapsed + 1);
      }, 1000);
    return () => clearInterval(timer);
  }, [playing, timeElapsed]);

  // verify if opened are equal
  useEffect(() => {
    if(shownCount === 2) {
      let opened = gridItems.filter(item => item.shown === true);
      if(opened.length === 2) {
        if(opened[0].item === opened[1].item){
          let tpmGrid = [...gridItems];
          // verify 1: if both are equal, make avery "shown" permanent.
          for(let i in tpmGrid){
            if(tpmGrid[i].shown){
              tpmGrid[i].permanentShown = true;
              tpmGrid[i].shown = false;
            }
          }
          setGridItems(tpmGrid);
          setShownCount(0);
         } else {
          // verify 2: if they are not equal, close all "shown"
          setTimeout(()=>{
            let tpmGrid = [...gridItems];
            for(let i in tpmGrid) {
              tpmGrid[i].shown = false;
            }
            setGridItems(tpmGrid);
            setShownCount(0);
          }, 1000)
        }


        setMoveCount(moveCount => moveCount + 1);
      }
    }
  }, [shownCount, gridItems]);

  // verify if game is over
  useEffect(() => {
    if(moveCount > 0 && gridItems.every(item => item.permanentShown === true)) {
      setPlaying(false);
    }
  }, [moveCount, gridItems]);

  const resetAndCreateGrid = () => {
    // step 01: reset the game.
    setTimeElapsed(0);
    setMoveCount(0);
    setShownCount(0);

    // step 2: create empty grid
    let tmpGrid:GridItemType[] = [];
    for(let i = 0; i < (items.length * 2); i++) tmpGrid.push({
      item: null, shown: false, permanentShown: false
    });
    // step 2.1: fill grid
    for(let w = 0;w < 2;w++){
      for(let i=0;i<items.length;i++){
        let pos = -1;
        while(pos < 0 || tmpGrid[pos].item !== null){
          pos = Math.floor(Math.random() * (items.length*2));
        }
        tmpGrid[pos].item = i;
      }
    }
    // 2.2: state
    setGridItems(tmpGrid);

    // step 3: start game.
    setPlaying(true);
  }

  const handlItemClick = (index: number) => {
    if(playing && index !== null && shownCount < 2) {
      let tpmGrid = [...gridItems];
      if(tpmGrid[index].permanentShown === false && tpmGrid[index].shown === false){
        tpmGrid[index].shown = true;
        setShownCount(shownCount + 1);
      }
      setGridItems(tpmGrid);
    }
  }

  return (
    <C.Container>
      <C.Info>
        <C.LogoLink href="">
          <img src={LogoImage} width='200' alt='' />
        </C.LogoLink>
        <C.InfoArea>
          <InfoItem label='Tempo' value={formatTimeElapsed(timeElapsed)}/>
          <InfoItem label='Movimentos' value={moveCount.toString()}/>
        </C.InfoArea>
        
        <Button label='Reiniciar' icon={RestartIcon} onClick={resetAndCreateGrid}/>
      </C.Info>
      <C.GridArea>
        <C.Grid>
            {gridItems.map((item, index) => (
              <GridItem
                key={index}
                item={item}
                onClick={() => handlItemClick(index)}
              />
            ))}
        </C.Grid>
      </C.GridArea>
    </C.Container>
  );
}

export default App;