
function new_quat() {
  return [0, 0, 0, 0];
}

function addQuat(q1, q2) {
  var out=[];
  out[0] = q1[0] + q2[0];
  out[1] = q1[1] + q2[1];
  out[2] = q1[2] + q2[2];
  out[3] = q1[3] + q2[3];
  return out;
};

function multQuat(q1, q2) {
  var out=[];
  var a1 = q1[0], a2 = q2[0],
      b1 = q1[1], b2 = q2[1],
      c1 = q1[2], c2 = q2[2],
      d1 = q1[3], d2 = q2[3];

  out[0] = a1*a2 - b1*b2 - c1*c2 - d1*d2;
  out[1] = a1*b2 + b1*a2 + c1*d2 - d1*c2;
  out[2] = a1*c2 - b1*d2 + c1*a2 + d1*b2;
  out[3] = a1*d2 + b1*c2 - c1*b2 + d1*a2;
  return out;
};

function real(q) { return q[0]; };

function vect(q) { return [q[1], q[2], q[3]]; };

function from_axis_angle(axis, angle) {
  var out=[]
  out = out || new_quat();
  var x = axis[0], y = axis[1], z = axis[2];
  var root=Math.sqrt(x*x + y*y + z*z);
  if (root==0){
    root=1;
  }
  var r = 1/root;
  var s = Math.sin(angle/2);
  out[0] = Math.cos(angle/2);
  out[1] = s * x * r;
  out[2] = s * y * r;
  out[3] = s * z * r;
  return out;
};

/**
 * Extracts the angle part, in radians, of a rotation quaternion.
 */
function angle(quat) {
  var a = quat[0];
  if (a < -1.0 || a > 1.0)
    return 0.0;
  var angle = 2 * Math.acos(a);
  if (angle > Math.PI)
    return (angle - 2 * Math.PI);
  return angle;
};

function quat2Matrix(q){
  var x2= Math.pow(q[1],2)
  var y2= Math.pow(q[2],2)
  var z2= Math.pow(q[3],2)

  var w= q[0]
  var x= q[1]
  var y= q[2]
  var z= q[3]

  return M=[
     1-2*y2-2*z2, 2*x*y-2*w*z, 2*x*z+2*w*y, 0,
     2*x*y+2*w*z, 1-2*x2-2*z2, 2*y*z-2*w*x, 0,
     2*x*z-2*w*y, 2*y*z+2*w*x, 1-2*x2-2*y2, 0,
     0 ,0, 0 ,1
  ]
}
function axis(quat) {
  var x = quat[1], y = quat[2], z = quat[3];
  var r = 1/Math.sqrt(x*x + y*y + z*z);
  return [x*r, y*r, z*r];
};

function getAxis(p0,p1,center){
        if (p0[0]==p1[0] && p0[1]==p1[1]) return vec3(0,0,0);
        difO_0=subtract(p0,center)
        difO_1=subtract(p1,center)
        axis = cross(difO_1,difO_0);
        axis= normalize(axis);
        return axis;
};
function getAngle(p0,p1,r,center){
  coef0=Math.sqrt((r*r)/(p0[0]*p0[0]+p0[1]*p0[1]+center[2]*center[2]))
    coef1=Math.sqrt((r*r)/(p1[0]*p1[0]+p1[1]*p1[1]+center[2]*center[2]))
    if (p0[0]==p1[0] && p0[1]==p1[1]) return 0;

    p1tb=vec3(coef1*p1[0],coef1*p1[1],0);
    p0tb=vec3(coef0*p0[0],coef0*p0[1],0);
    arc = subtract(p1tb, p0tb);
    angle = -negMod(arc);
    return angle;
};
function dot( v, w ){
  return ( v[0] * w[0] + v[1] * w[1] + w[2] * v[2] );
};

function negMod(v){
  return mod = -Math.sqrt(v[0]*v[0]+ v[1]*v[1] + v[2]*v[2]);
}        