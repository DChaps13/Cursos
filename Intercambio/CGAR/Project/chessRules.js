
function possibleMove(objChess,selectedPiece,selectedSquare){
    var src=selectedPiece;
    var dest=selectedSquare;
	var piece1=objChess[src[0]][src[1]]
	var piece2=objChess[dest[0]][dest[1]]
    if(src[0]==dest[0] && src[1]==dest[1]) return true;
	if(piece1*piece2>0){ //if they are from the same color
		return false;
	}
	
	color=piece1;
	//color<0 -> White
	piece1=Math.abs(piece1)
    if(piece1!=3 && !validateObstruction(src,dest,objChess) ) return false;
    
	if(piece1==1){

		return validatePawn(color,src,dest,objChess);
	}
	else if(piece1==2){
		return validateRook(src,dest,objChess);
	}
	else if(piece1==3){
		return validateKnight(src,dest,objChess);
	}
	else if(piece1==4){
		return validateBishop(src,dest,objChess);
	}
	else if(piece1==5){
		return validateQueen(src,dest,objChess);
	}
	else if(piece1==6){
		return validateKing(color,src,dest,objChess);
	}
	return true;
}
function validateObstruction(src,dest,chess){
    if(src[0]==dest[0]){
        for(i=src[1]+1;i<dest[1];i++){
            if(objChess[src[0]][i]!=0) return false;
        }
        for(i=dest[1]+1;i<src[1];i++){
            if(objChess[src[0]][i]!=0) return false;            
        }
    }
    else if(src[1]==dest[1]){
        for(i=src[0]+1;i<dest[0];i++){
            if(objChess[i][src[1]]!=0) return false;
        }
        for(i=dest[0]+1;i<src[0];i++){
            if(objChess[i][src[1]]!=0) return false;            
        }
    }
    else{ //diagonalMove

        for(i=src[0]+1,j=src[1]+1; i<dest[0] && j<dest[1];i++,j++){
            if(objChess[i][j]!=0) return false;
        }
        for(i=src[0]+1,j=src[1]-1; i<dest[0] && j>dest[1];i++,j--){
            if(objChess[i][j]!=0) return false;
        }
        for(i=src[0]-1,j=src[1]+1; i>dest[0] && j<dest[1];i--,j++){
            if(objChess[i][j]!=0) return false;
        }
        for(i=src[0]-1,j=src[1]-1; i>dest[0] && j>dest[1];i--,j--){
            if(objChess[i][j]!=0) return false;
        }
    }
    return true;

}
function permittedPiece(playerTurn,objChess,selectedSquare){
	if (objChess[selectedSquare[0]][selectedSquare[1]]*playerTurn<=0) return false;
	return true;
}

function validatePawn(color,src,dest,chess){
    //depending on color can go only forward
    if(color<0 && dest[1]>src[1] || color>0 && dest[1]<src[1]){
        return false;
    }
    
    //killing movement
    var dy=Math.abs(dest[1]-src[1]);
    if(Math.abs(dest[0]-src[0])==dy && dy==1 && objChess[dest[0]][dest[1]]!=0){
        return true;
    }

    //normal rules    
    if(((src[1]!=1 && src[1]!=6) && (dy==2)) //move 2 squares
        || (dy>2)//move more than 2 spots
        || (src[0]!=dest[0])
        || objChess[dest[0]][dest[1]]!=0) {
        return false;
    }
    return true;
}
function validateRook(src,dest,chess){
    if(src[0]!=dest[0] && src[1]!=dest[1]) return false;
    return true;
}
function validateKnight(src,dest,chess){
    var dx=Math.abs(dest[0]-src[0]);
    var dy=Math.abs(dest[1]-src[1]);
    if(dx+dy!=3 || dx*dy==0) return false;    
    return true;
}
function validateBishop(src,dest,chess){
    if(Math.abs(src[0]-dest[0])!=Math.abs(src[1]-dest[1])) return false;
    return true;
}
function validateQueen(src,dest,chess){
    if(src[0]==dest[0] || src[1]==dest[1]) return true;
    if(Math.abs(src[0]-dest[0])!=Math.abs(src[1]-dest[1])) return false;
    return true;
}
function validateKing(color,src,dest,chess){
    var dx=Math.abs(dest[0]-src[0]);
    var dy=Math.abs(dest[1]-src[1]);
    if(dx<=1 && dy <=1) return true;  
    return false;
}