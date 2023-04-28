const feedback = require("../../../helpers/feedback");
const common = require("../../../helpers/common");

module.exports = (baseRoute, middleWare, router) => {
  router.post(baseRoute, middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Feedback']
      #swagger.path = '/public/feedback'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Submit Feedback'
      #swagger.parameters['obj'] = {
          in: 'body',
          description: 'Feedback Details',
          required: true,
          schema: { 
            $rating:'rating',
            $forBusinessUse:'forBusinessUse',
            $email:'email',
            $comments:'comments',
            $xmin:'xmin',
            $ymin:'ymin',
            $xmax:'xmax',
            $ymax:'ymax',
            $centerX:'centerX',
            $centerY:'centerY',
            $scale:'scale',
            $otherUses:'otherUses',
            $education:'education',
            $recreation:'recreation',
            $realEstate:'realEstate',
            $business:'business',
            $delivery:'delivery',
            $economicDevelopment:'economicDevelopment',
            $reportProblem:'reportProblem',
            $myMapsId:'myMapsId',
            $featureId:'featureId'
          }}
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      // INSERT FEEDBACK
      const id = feedback.insertFeedback(req.body);
      res.send(id);
      return next();
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
  router.get(baseRoute + "/:id", middleWare, (req, res, next) => {
    /* 
      #swagger.tags = ['Public/Feedback']
      #swagger.path = '/public/feedback/{id}'
      #swagger.deprecated = false
      #swagger.ignore = false
      #swagger.summary = 'Retrieve Feedback'
       #swagger.parameters['id'] = {
          in: 'path',
          description: 'Feedback ID',
          required: true,
          type: 'string'
      } 
    */
    try {
      if (!common.isHostAllowed(req, res)) return;
      feedback.getFeedback(req.params.id, (feedback) => {
        res.send(feedback);
        return next();
      });
    } catch (e) {
      console.error(e.stack);
      res.status(500).send();
      return next();
    }
  });
};
