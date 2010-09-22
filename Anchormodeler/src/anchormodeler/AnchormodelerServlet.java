package anchormodeler;

import java.io.IOException;

import javax.jdo.PersistenceManager;
import javax.servlet.ServletException;
import javax.servlet.http.*;

@SuppressWarnings("serial")
public class AnchormodelerServlet extends HttpServlet {

	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Anchormodeler server");
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		resp.setContentType("text/plain");

		String action = req.getParameter("action");
		action=(action == null) ? "" : action;
		action=action.toLowerCase();
		
		if (action.equals("save")) {
			actionSave(req, resp);
		} else {
			resp.getWriter().println("ERROR: unknown action");
		}
	}

	@Override
	protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		//http://code.google.com/p/googleappengine/issues/detail?id=2994
		// CORS requires that browsers do an OPTIONS request before allowing
		// cross-site POSTs. UMP does not require this, but no browser
		// implements
		// UMP at this time. So, we reply to the OPTIONS request to trick
		// browsers into effectively implementing UMP.
		resp.setHeader("Access-Control-Allow-Origin", "*");
		resp.setHeader("Access-Control-Allow-Methods", "GET, POST");
		resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
		resp.setHeader("Access-Control-Max-Age", "86400");
	}

	private void actionSave(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		/*
		 * scope "public","private" modelName modelId (om nytt dokument så
		 * slopar man detta, annars overwrite model med detta id) keywords icon
		 * (textencoded png-image) modelXml
		 * 
		 * returnerar ok/error
		 */
		String modelName = req.getParameter("modelName");
		String modelXml = req.getParameter("modelXml");

		Model m = new Model();
		m.setModelName(modelName);
		m.setModelXml(modelXml);
		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			pm.makePersistent(m);
		} finally {
			pm.close();
		}
		resp.getWriter().println("OK");
	}

}
